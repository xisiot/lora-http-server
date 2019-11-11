const route = require('koa-route');
const consts = require('../lora-lib/constants');
const utils = require('../lora-lib/utils');
const net = require('net');
const code = require('../lora-lib/utils/code.js');
const config = require('../../config/config.json');
const CusValidator = require('../lora-lib/utils/validator.js');

const applicationRoute = (httpServer) => {
  var validator = new CusValidator('application');
  let mqClient = httpServer.mqClient;
  /*------------------------POST /application-------------------------------- */
  /**
   * @api {post} /application register application
   * @apiName application
   * @apiGroup Application
   * @apiParam (body) {String} userID User's ID.
   * @apiParam (body) {String} AppEUI  Application identifier.
   * @apiParam (body) {String} name  Name of the record.
   * @apiParam (body) {String} [description]  Description of the record.
   * @apiParamExample {json} Request-Example:
   POST http://10.3.242.235:3005/application
   request.body = {
     userID: "4c0c99ca5caef7c9f4707d641c726f55",
     AppEUI: "9816be466f467a17",
     name: "test",
     description: "description"
   }
   * @apiSuccess {Number} code  HTTP status Code
   * @apiSuccess {String} message Extra message
   * @apiSuccessExample {json} Success-Response:
   response.body = {
     code: 200,
     message: 'success',
   }
   * @apiErrorExample {json} Error-Response: user not registered
   response.body = {
     code: 3102,
     message: 'user not registered',
   }
   *
   */
  const application = async ctx => {
    const body = ctx.request.body;
    const query = {
      userID: body.userID,
      AppEUI: body.AppEUI,
      name: body.name,
    };
    if (body.description) {
      query.description = body.description;
    }
    let validation = validator.validate(query, 'postApplication');
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
    try {
      let isCreated = await httpServer.AppInfo.readItem({
        userID: body.userID,
        name: body.name,
      });
      if (isCreated) {
        ctx.response.body = code.createdName;
        return;
      }
      await httpServer.AppInfo.createItem(query);
      ctx.response.body = code.success;
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        ctx.response.body = code.createdApp;
      } else if (error.name === 'SequelizeForeignKeyConstraintError') {
        ctx.response.body = code.userNotRegistered;
      } else {
        ctx.response.body = {
          'message': error.message
        };
      }
    }
  };
  httpServer.app.use(route.post('/application', application));

  /*------------------------GET /application--------------------------------- */
  /**
   * @api {get} /application get application by userID
   * @apiName getAppByUserID
   * @apiGroup Application
   * @apiParam (query) {String} userID User's ID.
   * @apiParam (query) {Number} [from=1] Page number.
   * @apiParam (query) {Number} [size=10] Page size.
   * @apiParamExample {json} Request-Example:
   GET http://10.3.242.235:3005/application?userID=b696516f1d0d869818a36ac349acb458
   * @apiSuccessExample {json} Success-Response:
   response.body = {
    "count": 7,
    "rows": [
      {
        "AppEUI": "0293cb26df4f1b9d",
        "userID": "b696516f1d0d869818a36ac349acb458",
        "name": "LoRa测试",
        "createdAt": "2018-01-30T02:34:47.000Z",
        "updatedAt": "2018-01-30T02:34:47.000Z"
      },
        ...
   */

  const getAppByUserID = async ctx => {
    const query = ctx.request.query;
    if (!query.userID) {
      ctx.response.body = code.requiredParam.userID;
      return;
    }
    const whereOpts = {
      userID: query.userID
    };
    try {
      let res = await httpServer.AppInfo.readItems(whereOpts, null, query.from, query.size);
      ctx.response.body = res;
    } catch (error) {
      ctx.response.body = {
        'message': error.message
      };
    }
  };
  httpServer.app.use(route.get('/application', getAppByUserID));

  /*------------------------PUT /application--------------------------------- */
  /**
   * @api {put} /application update application by AppEUI
   * @apiName putAppByAppEUI
   * @apiGroup Application
   * @apiParam (body) {String} AppEUI Application identifier.
   * @apiParam (body) {String} [name ] Name of the record.
   * @apiParam (body) {String} [message] Extra message.
   * @apiParam (body) {String} [description] Description of the record.
   * @apiParamExample {json} Request-Example:
   PUT http://10.3.242.235:3005/application
   request.body = {
     userID: "4c0c99ca5caef7c9f4707d641c726f55",
     AppEUI: "9816be466f467a17",
     name: "test"
   }
   * @apiSuccess {Number} code HTTP status Code
   * @apiSuccess {String} message Extra message
   * @apiSuccessExample {json} Success-Response:
   response.body = {
     code: 200,
     message: 'success',
   }
   * @apiErrorExample {json} Error-Response: AppEUI do not exist
   response.body = {
     code: 4001,
     message: 'No such item',
   }
   *
   */
  const putAppByAppEUI = async (ctx) => {
    const body = ctx.request.body;
    if (!body.AppEUI) {
      ctx.response.body = code.requiredParam.AppEUI;
      return;
    }
    if (body.AppEUI.length !== consts.APPEUI_LEN * 2) {
      ctx.response.body = code.invParam.AppEUI;
      return;
    }
    //查询条件
    const whereOpts = {
      AppEUI: body.AppEUI,
    };
    let kv = {
      name: body.name,
      description: body.description
    };
    let value = {};
    for (let key in kv) {
      if (kv[key]) {
        value[key] = kv[key];
      }
    }
    try {
      let res = await httpServer.AppInfo.updateItem(whereOpts, value);
      ctx.response.body = res[0] ? code.success : code.noItem; //res[0]=1 or 0
    } catch (error) {
      ctx.response.body = {
        'message': error.message
      };
    }
  };
  httpServer.app.use(route.put('/application', putAppByAppEUI));

  /*------------------------DELETE /application------------------------------ */
  /**
   * @api {delete} /application delete application
   * @apiName deleteAppByAppEUI
   * @apiGroup Application
   * @apiParam (body) {String} AppEUI Application identifier.
   * @apiParamExample {json} Request-Example:
   DELETE http://10.3.242.235:3005/application
   request.body = {
     AppEUI: "4c0c99ca5caef7c9f4707d641c726f55"
   }
   * @apiSuccess {Number} code HTTP status Code
   * @apiSuccess {String} message Extra message
   * @apiSuccessExample {json} Success-Response:
   response.body = {
     code: 200,
     message: 'success',
   }
   *
   */
  const deleteAppByAppEUI = async (ctx) => {
    const body = ctx.request.body;
    if (!body.AppEUI) {
      ctx.response.body = code.requiredParam.AppEUI;
      return;
    }
    if (body.AppEUI.length !== consts.APPEUI_LEN * 2) {
      ctx.response.body = code.invParam.AppEUI;
      return;
    }
    const whereOpts = {
      AppEUI: body.AppEUI,
    };
    try {
      let ar = await httpServer.AppInfo.removeItem(whereOpts);
      ctx.response.body = ar ? code.success : code.noItem;
    } catch (error) {
      ctx.response.body = {
        'message': error.message
      };
    }
  };
  httpServer.app.use(route.delete('/application', deleteAppByAppEUI));

  /*------------------------GET /application/:AppEUI------------------------- */
  /**
   * @api {get} /application/:AppEUI get application by AppEUI
   * @apiName getAppByAppEUI
   * @apiGroup Application
   * @apiParamExample {json} Request-Example:
   * GET http://10.3.242.235:3005/application/847cb05ba4efde84
   * @apiSuccessExample Success-Response:
   response.body = {
    "AppEUI": "847cb05ba4efde84",
    "userID": "b696516f1d0d869818a36ac349acb458",
    "name": "LoRa server功能测试",
    "description": null,
    "createdAt": "2018-03-22T03:36:48.000Z",
    "updatedAt": "2018-03-22T03:36:48.000Z"
    }
   */
  const getAppByAppEUI = async (ctx, AppEUI) => {
    const whereOpts = {
      AppEUI
    };
    try {
      let res = await httpServer.AppInfo.readItem(whereOpts);
      ctx.response.body = res;
    } catch (error) {
      ctx.response.body = {
        'message': error.message
      };
    }
  };
  httpServer.app.use(route.get('/application/:AppEUI', getAppByAppEUI));

  /*------------------------POST /app2devType-------------------------------- */
  /**
   * @api {post} /app2devType store or update data structure
   * @apiName postApp2PB
   * @apiGroup Application
   * @apiParam (query) {String} AppEUI Application identifier.
   * @apiParam (query) {String} message Configuration message.
   * @apiParamExample {json} Request-Example:
   POST http://10.3.242.235:3005/app2devType
   request.body = {
     AppEUI: "0000000000000000"
     message: "{...}"
   }
   * @apiSuccess {Number} code HTTP status Code
   * @apiSuccess {String} message Extra message
   * @apiSuccessExample Success-Response:
   response.body = {
     code: 200,
     message: 'success',
   }
   * @apiErrorExample {json} Error-Response: lack of param 'message'
   response.body = {
     code: 3134,
     message: 'message required',
   }
   */
  const postApp2PB = async ctx => {
    const body = ctx.request.body;
    const query = {
      AppEUI: body.AppEUI,
      message: body.message,
    };
    if (!body.AppEUI) {
      ctx.response.body = code.requiredParam.AppEUI;
      return;
    }
    if (!body.message) {
      ctx.response.body = code.requiredParam.message;
      return;
    }
    let message;
    try {
      message = JSON.parse(body.message);
    } catch(err) {
      console.log(err);
      ctx.response.body = code.invParam.message;
      return;
    }
    let whereOpts = {
      AppEUI: body.AppEUI
    };
    let value = {
      message: message
    };
    try {
      let exist = await httpServer.App2PB.existItem(whereOpts);
      if (exist) {
        await httpServer.App2PB.updateItem(whereOpts, value);
      } else {
        await httpServer.App2PB.createItem(query);
      }
      mqClient.send([{
        topic: config.mqClient_as.topics.pbFromHttpServer,
        messages: query,
      }]);
      ctx.response.body = code.success;
    } catch (error) {
      ctx.response.body = {
        'message': error
      };
    }
  };
  httpServer.app.use(route.post('/app2devType', postApp2PB));

  /*------------------------GET /app2devType-------------------------------- */
  /**
   * @api {get} /app2devType get data structure
   * @apiName getApp2PB
   * @apiGroup Application
   * @apiParam (query) {String} AppEUI Application identifier.
   * @apiParamExample {json} Request-Example:
   * GET http://10.3.242.235:3005/app2devType?AppEUI=0000000000000000
   * @apiSuccessExample Success-Response:
   response.body = {
     "AppEUI": "0000000000000000",
     "message": "{\"pm25\":{\"type\":\"int32\",\"id\":1,\"name\":\"pm2.5\",\"unit\":\"μg/m3\"},\"pm10\":{\"type\":\"int32\",\"id\":2,\"name\":\"pm10\",\"unit\":\"μg/m3\"},\"battery\":{\"type\":\"int32\",\"id\":3,\"name\":\"风速\",\"unit\":\"m/s\"}}",
     "createdAt": "2019-10-17T06:42:19.000Z",
     "updatedAt": "2019-10-17T06:42:19.000Z"
   }
   */

  const getApp2PB = async ctx => {
    const query = ctx.request.query;
    const whereOpts = {
      AppEUI: query.AppEUI,
    };
    try {
      let res = await httpServer.App2PB.readItem(whereOpts);
      ctx.response.body = res ? res : code.noItem;
    } catch (error) {
      ctx.response.body = {
        'message': error.message
      };
    }
  };
  httpServer.app.use(route.get('/app2devType', getApp2PB));

};



module.exports = applicationRoute;
