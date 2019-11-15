const route = require('koa-route');
const consts = require('../lora-lib/constants');
const utils = require('../lora-lib/utils');
const code = require('../lora-lib/utils/code.js');
const CusValidator = require('../lora-lib/utils/validator.js');

const deviceRoute = (httpServer) => {
  var validator = new CusValidator('device');
  /*------------------------POST /device---------------------------------- */
  /**
   * @api {post} /device register device
   * @apiName device
   * @apiGroup Device
   *
   * @apiParam (body) {String} AppEUI Application identifier.
   * @apiParam (body) {String} DevEUI End-device identifier.
   * @apiParam (body) {String} [AppKey]  Application key. An AES-128 root key specific to the end-device.（Required for OTAA）
   * @apiParam (body) {String} name Name of the record.
   * @apiParam (body) {String} ProtocolVersion Protocol version.
   * @apiParam (body) {String} [activationMode] Over-The-Air Activation (OTAA) or Activation By Personalization (ABP).
   * @apiParam (body) {String} [DevAddr]  End-device address.（Required for ABP）
   * @apiParam (body) {String} [AppSKey]  Application session key.（Required for ABP）
   * @apiParam (body) {String} [NwkSKey]  Network session key.（Required for ABP）
   * @apiParam (body) {String} [DevNonce]  A random value of 2 octets. （Required for ABP）
   * @apiParam (body) {String} [frequencyPlan] Frequency plan.（Required for ABP）
   * @apiParam (body) {String} [ADR]  Adaptive data rate.（Required for ABP）
   * @apiParam (body) {String} [ChMask]  The channel mask.（Required for ABP）
   * @apiParam (body) {String} [CFList]  List of channel frequencies.（Required for ABP）
   * @apiParam (body) {String} [ChDrRange]  Chanel data-rate range.（Required for ABP）
   * @apiParam (body) {String} [RX1CFList] List of channel frequencies of the first receive window.（Required for ABP）
   * @apiParam (body) {String} [RX2Freq] The fixed frequency of the second receive window.（Required for ABP）
   * @apiParam (body) {String} [MaxEIRP]  Maximum allowed end-device Effective Isotropic Radiated Power（Required for ABP）
   * @apiParam (body) {String} [description] Description of the record.

   * @apiParamExample {json} Request-Example:
   POST http://10.3.242.235:3005/device
   request.body = {
     activationMode:"OTAA",
     AppEUI: "0000000000000000",
     DevEUI: "1111111111111111",
     AppKey: "10000000000000000000000000000000",
     ProtocolVersion: "1.0.2"
   }
   * @apiSuccess {Number} code HTTP status Code
   * @apiSuccess {String} message Extra message
   * @apiSuccessExample {json} Success-Response:
   response.body = {
     code: 200,
     message: 'success',
   }
   * @apiErrorExample {json} Error-Response: invalid activationMode
   response.body = {
     code: 2115,
     message: 'invalid activationMode',
   }
   *
   */
  const device = async ctx => {
    const body = ctx.request.body;
    if (!body.activationMode) {
      ctx.response.body = code.requiredParam.activationMode;
    } else {
      let queryDeviceInfo = null;
      let queryDeviceConfig = null;
      if (body.activationMode === 'OTAA') {
        queryDeviceInfo = {
          AppEUI: body.AppEUI,
          DevEUI: body.DevEUI,
          AppKey: body.AppKey,
          name: body.name,
          ProtocolVersion: body.ProtocolVersion,
          activationMode: body.activationMode,
          description: body.description,
        };
        let validation = validator.validate(queryDeviceInfo, 'postDeviceOTAA');
        // console.log(validation);
        if (!validation.result) {
          if (validation.type === 'invalid') {
            ctx.response.body = code.invParam[validation.param];
            return;
          } else if (validation.type === 'required') {
            ctx.response.body = code.requiredParam[validation.param];
            return;
          }
        }
      } else if (body.activationMode === 'ABP') {
        queryDeviceInfo = {
          AppEUI: body.AppEUI,
          DevEUI: body.DevEUI,
          DevAddr: body.DevAddr,
          name: body.name,
          AppSKey: body.AppSKey,
          NwkSKey: body.NwkSKey,
          ProtocolVersion: body.ProtocolVersion,
          activationMode: body.activationMode,
          DevNonce: body.DevNonce,
          description: body.description,
        };
        queryDeviceConfig = {
          DevAddr: body.DevAddr,
          frequencyPlan: body.frequencyPlan,
          ADR: body.ADR,
          ChMask: body.ChMask,
          CFList: body.CFList,
          ChDrRange: body.ChDrRange,
          RX1CFList: body.RX1CFList,
          RX2Freq: body.RX2Freq,
          RX2DataRate: body.RX2DataRate,
          MaxEIRP: body.MaxEIRP,
        };
        if (body.description) {
          queryDeviceInfo.description = body.description;
        }
        let validation = validator.validate({
          ...queryDeviceInfo,
          ...queryDeviceConfig
        }, 'postDeviceABP');
        // console.log(validation);
        if (!validation.result) {
          if (validation.type === 'invalid') {
            ctx.response.body = code.invParam[validation.param];
            return;
          } else if (validation.type === 'required') {
            ctx.response.body = code.requiredParam[validation.param];
            return;
          }
        }
      }
      console.log('passing!');
      if (body.description) {
        queryDeviceInfo.description = body.description;
      }
      let query = {
        ...queryDeviceInfo,
        ...queryDeviceConfig
      };
      try {
        await httpServer.DeviceInfo.createItem(queryDeviceInfo);
        if (queryDeviceConfig) {
          await httpServer.DeviceConfig.createItem(queryDeviceConfig);
        }
        ctx.response.body = code.success;
      } catch (error) {
        await httpServer.DeviceInfo.removeItem({
          DevEUI: body.DevEUI
        });
        if (error.name === 'SequelizeUniqueConstraintError') {
          ctx.response.body = code.createdDev;
          //DevAddr DevEUI name 其中之一重复就报错
        } else if (error.name === 'SequelizeForeignKeyConstraintError') {
          ctx.response.body = code.appNotCreated;
        } else {
          ctx.response.body = {
            'message': error.message
          };
        }
      }
    }
  };
  httpServer.app.use(route.post('/device', device));

  /*------------------------GET /device----------------------------------- */
  /**
   * @api {get} /device get device by AppEUI
   * @apiName getDeviceByAppEUI
   * @apiGroup Device
   *
   * @apiParam (query) {String} AppEUI Application identifier.
   * @apiParam (query) {Number} [from=1] Page number.
   * @apiParam (query) {Number} [size=10] Page size.
   * @apiParamExample {json} Request-Example:
   GET http://10.3.242.235:3005/device?AppEUI=f8c97a4faf10d53c&from=2&size=1
   * @apiSuccess {Number} count  Count of the results.
   * @apiSuccess {String} rows  Results of the query.
   * @apiSuccessExample Success-Response:
   response.body = {
     "count": 8,
     "rows": [{
       "DevEUI": "96549f3396549f07",
       "DevAddr": null,
       "AppKey": "3316b5aadca72d203316b5aadca72d20",
       "AppEUI": "f8c97a4faf10d53c",
       "name": "20",
       "DevNonce": null,
       "AppNonce": null,
       "NwkSKey": null,
       "AppSKey": null,
       "activationMode": "OTAA",
       "ProtocolVersion": "1.0.2",
       "FCntUp": 0,
       "NFCntDown": 0,
       "AFCntDown": 0,
       "description": null,
       "createdAt": "2018-06-27T08:06:42.000Z",
       "updatedAt": "2018-06-27T08:06:42.000Z"
     }],
     "pagecount": 8
   }
        ...
   *
   */

  const getDeviceByAppEUI = async ctx => {
    let query = ctx.request.query;
    if (!query.AppEUI) {
      ctx.response.body = code.requiredParam.AppEUI;
      return;
    }
    let whereOpts = {
      AppEUI: query.AppEUI
    };
    try {
      let res = await httpServer.DeviceInfo.readItems(whereOpts, null, query.from, query.size);
      ctx.response.body = res;
    } catch (error) {
      ctx.response.body = {
        'message': error.message
      };
    }
  };
  httpServer.app.use(route.get('/device', getDeviceByAppEUI));

  /*------------------------GET /device/:DevEUI--------------------------- */
  /**
   * @api {get} /device/:DevEUI get device by DevEUI
   * @apiName getDeviceByDevEUI
   * @apiGroup Device
   * @apiParamExample {json} Request-Example:
   GET http://10.3.242.235:3005/device/96549f3396549f02
   * @apiSuccessExample Success-Response:
   response.body = {
     "DevEUI": "96549f3396549f02",
     "DevAddr": null,
     "AppKey": "13fafce1d15f8fb213fafce1d15f8fb2",
     "AppEUI": "f8c97a4faf10d53c",
     "name": "15",
     "DevNonce": null,
     "AppNonce": null,
     "NwkSKey": null,
     "AppSKey": null,
     "activationMode": "OTAA",
     "ProtocolVersion": "1.0.2",
     "FCntUp": 0,
     "NFCntDown": 0,
     "AFCntDown": 0,
     "description": null,
     "createdAt": "2018-06-27T08:05:09.000Z",
     "updatedAt": "2018-06-27T08:05:09.000Z"
   }
   *
   */
  const getDeviceByDevEUI = async (ctx, DevEUI) => {
    let d = DevEUI;
    if (d.length !== consts.DEVEUI_LEN * 2) {
      ctx.response.body = {
        code: 2103,
        message: 'invalid DevEUI'
      };
      return;
    }
    let query = {
      DevEUI
    };
    let projection = [];
    try {
      await httpServer.DeviceInfo.readItem(query, projection)
        .then((res) => {
          ctx.response.body = res;
        });
    } catch (error) {
      ctx.response.body = {
        'message': error.message
      };
    }
  };
  httpServer.app.use(route.get('/device/:DevEUI', getDeviceByDevEUI));

  /*------------------------GET /device/:AppEUI/:DevAddr/data------------- */
  /**
   * @api {get} /device/:AppEUI/:DevAddr/data get data sent by the device
   * @apiName deviceData
   * @apiGroup Device
   * @apiParam (query) {Number} [from=1] Page number.
   * @apiParam (query) {Number} [size=10] Page size.
   * @apiParamExample {json} Request-Example:
   GET http://10.3.242.235:3005/device/0000000000000000/10fc2942/data
   * @apiSuccess {Number} count  Count of the results.
   * @apiSuccess {String} rows  Results of the query.
   * @apiSuccessExample Success-Response:
   response.body = {
     "count": 4,
     "rows": [{
         "_id": "5dad90aac20200007f002b82",
         "DevAddr": "10fc2942",
         "operation": "Update",
         "payload": {
           "state": {
             "reported": {
               "data": {
                 "CH4": 0,
                 "temperature": 26,
                 "humidity": 56,
                 "battery": 91,
                 "waterlevel": 0
               }
             }
           }
         },
         "timestamp": 1567647117,
         "__v": 0
       },
       ...
   *
   */
  const deviceData = async (ctx, AppEUI, DevAddr) => {
    const query = ctx.request.query;
    const from = query.from ? parseInt(query.from) : 1;
    const size = query.size ? parseInt(query.size) : 10;
    try {
      let db = await httpServer.createDB();
      if (!db[AppEUI]) {
        ctx.response.body = {
          'message': 'AppEUI do not exist'
        };
        return;
      }
      let rows = await db[AppEUI].aggregate([{
          $match: {
            DevAddr
          }
        }, {
          $project: {
            _id: 0,
            data: "$payload.state.reported.data",
            timestamp: 1
          }
        }, {
          $sort: {
            timestamp: -1
          }
        }])
        .skip((from - 1) * size)
        .limit(size);
      let count = await db[AppEUI].count({
        DevAddr
      });
      ctx.response.body = {
        count,
        rows
      };
    } catch (error) {
      ctx.response.body = {
        'message': error.message
      };
    }
  };
  httpServer.app.use(route.get('/device/:AppEUI/:DevAddr/data', deviceData));

  /*------------------------PUT /application------------------------------- */
  // const putDevByDevEUI = async (ctx) => {
  //   const body = ctx.request.body;
  //   if (!body.DevEUI) {
  //     return ctx.response.body = code.requiredParam.DevEUI;
  //   }
  //   if (body.DevEUI.length !== consts.DEVEUI_LEN * 2) {
  //     return ctx.response.body = code.invParam.DevEUI;
  //   }
  //   const whereOpts = {
  //     DevEUI: body.DevEUI,
  //   };
  //   const value = {}
  //   try {
  //     let res = await httpServer.Devic.updateItem(whereOpts, value);
  //     ctx.response.body = res[0] ? code.success : code.noItem; //res[0]=1 or 0
  //   } catch (error) {
  //     ctx.response.body = {
  //       'message': error.message
  //     };
  //   }
  // };
  // httpServer.app.use(route.put('/device', putDevByDevEUI));

  /*------------------------DELETE /device---------------------------------- */
  /**
   * @api {delete} /device delete device
   * @apiName deleteDeviceByDevEUI
   * @apiGroup Device
   * @apiParam (body) {String} DevEUI  End-device identifier.
   * @apiParamExample {json} Request-Example:
   DELETE http://10.3.242.235:3005/device
   * @apiSuccess {Number} code HTTP status Code
   * @apiSuccess {String} message Extra message
   * @apiSuccessExample {json} Success-Response:
   response.body = {
     code: 200,
     message: 'success',
   }
   * @apiErrorExample {json} Error-Response: DevEUI do not exist
   response.body = {
     code: 4001,
     message: 'No such item',
   }
   *
   */
  const deleteDeviceByDevEUI = async (ctx) => {
    const body = ctx.request.body;
    if (!body.DevEUI) {
      ctx.response.body = code.requiredParam.DevEUI;
      return;
    }
    if (body.DevEUI.length !== consts.DEVEUI_LEN * 2) {
      ctx.response.body = code.invParam.DevEUI;
    }
    let query = {
      DevEUI: body.DevEUI
    };
    try {
      let res = await httpServer.DeviceInfo.removeItem(query);
      ctx.response.body = res ? code.success : code.noItem;
    } catch (error) {
      ctx.response.body = {
        'message': error.message
      };
    }
  };
  httpServer.app.use(route.delete('/device', deleteDeviceByDevEUI));
};

module.exports = deviceRoute;
