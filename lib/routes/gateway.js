const route = require('koa-route');
const consts = require('../lora-lib/constants');
const utils = require('../lora-lib/utils');
const code = require('../lora-lib/utils/code.js');
const CusValidator = require('../lora-lib/utils/validator.js');
const gatewayRoute = (httpServer) => {
  var validator = new CusValidator('gatewayInfo');

  /*------------------------POST /gateway----------------------------------- */
  /**
  * @api {post} /gateway register gateway
  * @apiName gateway
  * @apiGroup Gateway
  * @apiParam (body) {String} userID User's ID.
  * @apiParam (body) {String} gatewayID	Gateway's ID.
  * @apiParam (body) {String} name	Name of the gateway.
  * @apiParam (body) {String} type	Indoor or outdoor.
  * @apiParam (body) {String} frequencyPlan	Frequency plan.
  * @apiParam (body) {String} location	location of the gateway.
  * @apiParam (body) {String} model Model.
  * @apiParam (body) {String} [description]	Description of the record.
  * @apiParamExample {json} Request-Example:
  POST http://10.3.242.235:3005/gateway
  request.body = {
  	"userID": "82fd76c122c2cc553e780bdc7739e72c",
  	"gatewayId": "111122223333ffff",
  	"name": "测试网关1",
  	"frequencyPlan": "Asia 920-923MHz",
  	"location": "北邮南门",
  	"type": "indoor",
  	"model": "X01",
  	"description": "在南门的第一个网关"
  }
  @apiSuccess {Number} code HTTP status Code
  @apiSuccess {String} message Extra message
  @apiError {Number} [code] Error code
  @apiError {String} message Extra message
  @apiErrorExample {json} Error-Example：gatewayId is invalid
  response.body = {
    code: 2110,
    message: 'invalid gatewayId'
  };
  @apiErrorExample {json} Error-Example: other error
  response.body = {
    message: errMsg
  };
  */
  const gateway = async ctx => {
    const body = ctx.request.body;
    const query = {
      userID: body.userID,
      gatewayId: body.gatewayId,
      name: body.name,
      type: body.type,
      frequencyPlan: body.frequencyPlan,
      location: body.location,
      model: body.model,
      description: body.description,
    };
    let validation = validator.validate(query, 'postGatewayInfo');
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
      await httpServer.GatewayInfo.createItem(query);
      ctx.response.body = code.success;
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        ctx.response.body = code.createdGateway;
      } else if (error.name === 'SequelizeForeignKeyConstraintError') {
        ctx.response.body = code.userNotRegistered;
      } else {
        ctx.response.body = {
          'message': error.message
        };
      }
    }
  };
  httpServer.app.use(route.post('/gateway', gateway));

  /*------------------------GET /gateway------------------------------------ */
  /**
  @api {get} /gateway get gataway by userID
  @apiName getGatewayByUserID
  @apiGroup Gateway
  @apiParam (query) {String} userID  User's ID.
  @apiParam (query) {Number} [from=1]  Page number.
  @apiParam (query) {Number} [size=10]  Page size.
  @apiParamExample {json} Request-Example:
  GET http://10.3.242.235:3005/gateway?userID=82fd76c122c2cc553e780bdc7739e72c&from=1&size=3
  @apiSuccess {Object} response.body Gateway details.
  @apiError {Number} [code] Error code
  @apiError {String} message Extra message
  @apiSuccessExample {json} Success-Response:
  response.body = {
  	"count": 8,
  	"rows": [
  		{
  			"gatewayId": "ffffffffffffffff",
  			"userID": "82fd76c122c2cc553e780bdc7739e72c",

  			"name": "测试网关9",
  			"frequencyPlan": "Asia 920-923MHz",
  			"location": "东门",
  			"RFChain": 0,
  			"type": "outdoor",
  			"model": "X01",
  			"description": "在东门的网关",
  			"createdAt": "2019-10-18T06:42:38.000Z",
  			"updatedAt": "2019-10-18T06:42:38.000Z"
  		}
  	],
  	"pagecount": 8
  }
  @apiErrorExample Error-Example: userID is invalid
  response.body = {
        code: 2111,
        message: 'invalid userID'
  };
  @apiErrorExample Error-Example: other error
  response.body = {
      message: errMsg
  };
  */
  const getGatewayByUserID = async ctx => {
    const query = ctx.request.query;
    const whereOpts = {
      userID: query.userID
    };
    let validation = validator.validate(whereOpts, 'byUserID');
    if (!validation.result) {
      if (validation.type === 'invalid') {
        ctx.response.body = code.invParam[validation.param];
        return;
      } else if (validation.type === 'required') {
        ctx.response.body = code.requiredParam[validation.param];
      }
    }
    try {
      let res = await httpServer.GatewayInfo.readItems(whereOpts, null, query.from, query.size);
      ctx.response.body = res;
    } catch (error) {
      console.log(error);
      ctx.response.body = {
        'message': error.message
      };
    }
  };
  httpServer.app.use(route.get('/gateway', getGatewayByUserID));

  /*------------------------GET /gateway/:gatewayId-------------------------- */
  /**
  @api {get} /gateway/gatewayID get gateway by gatewayID
  @apiName getGatewayByGatewayId
  @apiGroup Gateway
  @apiParamExample {json} Request-Example:
  GET http://10.3.242.235:3005/gateway/1111222233334444
  @apiSuccess {Object} response.body Gateway details.
  @apiError {Number} [code] Error code
  @apiError {String} message Extra message
  @apiSuccessExample {json} Success-Response:
  response.body = {
  	"gatewayId": "1111222233334444",
  	"userID": "82fd76c122c2cc553e780bdc7739e72c",
  	"name": "测试网关1",
  	"frequencyPlan": "Asia 920-923MHz",
  	"location": "北邮南门",
  	"RFChain": 0,
  	"type": "indoor",
  	"model": "X01",
  	"description": "在南门的第一个网关",
  	"createdAt": "2019-10-18T03:20:50.000Z",
  	"updatedAt": "2019-10-18T03:20:50.000Z"
  }
  @apiErrorExample Error-Example: gatewayId is invalid
  response.body = {
        code: 2110,
        message: 'invalid gatewayId'
  };
  @apiErrorExample Error-Example: other error
  response.body = {
      message: errMsg
  };
  */
  const getGatewayByGatewayId = async (ctx, gatewayId) => {
    const whereOpts = {
      gatewayId
    };
    let validation = validator.validate(whereOpts, 'byGatewayId');
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
      await httpServer.GatewayInfo.readItem(whereOpts)
        .then((res) => {
          ctx.response.body = res;
        });
    } catch (error) {
      console.log(error);
      ctx.response.body = {
        'message': error.message
      };
    }
  };
  httpServer.app.use(route.get('/gateway/:gatewayId', getGatewayByGatewayId));

  /*------------------------GET //gateway/:gatewayId/data------------------------------------- */
  /**
  @api {get} /gateway/gatewayID/data gat gatwway status info
  @apiName getGatewayStatusByGatewayId
  @apiGroup Gateway
  @apiParam (query) {Number} [from=1] Page number.
  @apiParam (query) {Number} [size=10] Page size.
  @apiParamExample {json} Request-Example:
  GET http://10.3.242.235:3005/gateway/1111222211112222/data?from=1&size=3
  @apiSuccess {Object} response.body Gateway status.
  @apiError {Number} [code] Error code
  @apiError {String} message Extra message
  @apiSuccessExample {json} Success-Response:
  response.body = {
  	"count": 1,
  	"rows": [
  		{
  			"gatewayId": "1111222211112222",
  			"id": 4,
  			"time": "2018-01-26T02:09:38.000Z",
  			"lati": null,
  			"long": null,
  			"alti": null,
  			"rxnb": 0,
  			"rxok": 0,
  			"rxfw": 0,
  			"ackr": 0,
  			"dwnb": 0,
  			"txnb": 0,
  			"createdAt": "2018-01-26T02:09:42.000Z",
  			"updatedAt": "2018-01-26T02:09:42.000Z"
  		}
  	],
  	"pagecount": 1
  }
  @apiErrorExample Error-Example: gatewayId is invalid
  response.body = {
        code: 2110,
        message: 'invalid gatewayId'
  };
  @apiErrorExample Error-Example: other error
  response.body = {
      message: errMsg
  };
  */
  const getGatewayStatusByGatewayId = async (ctx, gatewayId) => {
    const query = ctx.request.query;
    const whereOpts = {
      gatewayId
    };
    let validation = validator.validate(whereOpts, 'byGatewayId');
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
      let res = await httpServer.GatewayStatus.readItems(whereOpts, null, query.from, query.size);
      ctx.response.body = res;
    } catch (error) {
      console.log(error);
      ctx.response.body = {
        'message': error.message
      };
    }
  };
  httpServer.app.use(route.get('/gateway/:gatewayId/data', getGatewayStatusByGatewayId));

  /*------------------------PUT /gateway/:gatewayId/data--------------------- */
  /**
  @api {put} /gateway update gataway by gatewayId
  @apiName putDevByGatewayId
  @apiGroup Gateway
  @apiParam (body) {String} gatewayId  Gateway's ID.
  @apiParamExample {json} Request-Example:
  PUT http://10.3.242.235:3005/gateway
  request.body = {
    gatewayId: "ffffffffffffffff",
    name: "update test",
    type: "indoor"
  };
  @apiSuccess {Number} code HTTP status Code
  @apiSuccess {String} message Extra message
  @apiError {Number} [code] Error code
  @apiError {String} message Extra message
  @apiErrorExample Error-Example: gatewayId is invalid
  response.body = {
        code: 2110,
        message: 'invalid gatewayId'
  };
  @apiErrorExample Error-Example: other error
  response.body = {
      message: errMsg
  };
  */
  const putDevByGatewayId = async (ctx) => {
    const body = ctx.request.body;
    if (!body.gatewayId) {
      ctx.response.body = code.requiredParam.gatewayId;
      return;
    }
    if (body.gatewayId.length !== consts.DEVEUI_LEN * 2) {
      ctx.response.body = code.invParam.gatewayId;
      return;
    }
    const whereOpts = {
      gatewayId: body.gatewayId,
    };
    let kv = {
      name: body.name,
      type: body.type,
      frequencyPlan: body.frequencyPlan,
      location: body.location,
      RFChain: body.RFChain,
      model: body.model,
      address: body.address,
      description: body.description
    };
    let value = {};
    for (let key in kv) {
      if(kv[key]){
        value[key] = kv[key];
      }
    }
    try {
      let res = await httpServer.GatewayInfo.updateItem(whereOpts, value);
      ctx.response.body = res[0] ? code.success : code.noItem; //res[0]=1 or 0
    } catch (error) {
      ctx.response.body = {
        'message': error.message
      };
    }
  };
  httpServer.app.use(route.put('/gateway', putDevByGatewayId));

  /*------------------------DELETE /gateway---------------------------------- */
  /**
  @api {delete} /gateway delete gateway
  @apiName deleteGatewayByGatewayId
  @apiGroup Gateway
  @apiParam (body) {String} gatewayId  Gateway's ID.
  @apiParamExample {json} Request-Example:
  DELETE http://10.3.242.235:3005/gateway
  request.body = {
    gatewayId: "1111222233334444"
  }
  @apiSuccess {Number} code HTTP status Code
  @apiSuccess {String} message Extra message
  @apiError {Number} [code] Error code
  @apiError {String} message Extra message
  @apiErrorExample Error-Example: gatewayId is invalid
  response.body = {
        code: 2110,
        message: 'invalid gatewayId'
  };
  @apiErrorExample Error-Example: other error
  response.body = {
      message: errMsg
  };
  */
  const deleteGatewayByGatewayId = async (ctx) => {
    const body = ctx.request.body;
    const whereOpts = {
      gatewayId: body.gatewayId
    };
    let validation = validator.validate(whereOpts, 'byGatewayId');
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
      let res = await httpServer.GatewayInfo.removeItem(whereOpts);
      ctx.response.body = res ? code.success : code.noItem;
    } catch (error) {
      console.log(error);
      ctx.response.body = {
        'message': error.message
      };
    }
  };
  httpServer.app.use(route.delete('/gateway', deleteGatewayByGatewayId));
};

module.exports = gatewayRoute;
