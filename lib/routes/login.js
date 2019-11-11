const route = require('koa-route');
const consts = require('../lora-lib/constants');
const utils = require('../lora-lib/utils');
const code = require('../lora-lib/utils/code.js');
const CusValidator = require('../lora-lib/utils/validator.js');
const loginRoute = (httpServer) => {
  var validator = new CusValidator('user');
  /**
    @api {post} /login login
    @apiName login
    @apiGroup Login
    @apiParam (body) {String} email User's email
    @apiParam (body) {String} password User's password
    @apiParamExample {json} Request-Example:
    POST http://10.3.242.235:3005/login
    request.body = {
      password: "123456",
      email: "xuke@qq.com"
    }
    @apiSuccess {Number} code HTTP status Code
    @apiSuccess {String} userID User's ID.
    @apiErrorExample Error-Response:：user not registered
    response.body = {
      code: 3102,
      message: 'user not registered'
    };
   */

  const login = async ctx => {
    const body = ctx.request.body;
    const query = {
      email: body.email,
      password: body.password,
    };
    let validation = validator.validate(query, 'login');
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
      let whereOpts = {
        email: body.email
      };
      let res = await httpServer.Developers.readItem(whereOpts, ['password', 'developer_id']);
      if (!res) {
        ctx.response.body = code.userNotRegistered;
        return;
      }
      if (res.password === body.password) {
        ctx.response.body = {
          code: 200,
          'userID': res.developer_id
        };
      } else {
        ctx.response.body = code.userPasswordErr;
      }
    } catch (error) {
      ctx.response.body = {
        message: error.message
      };
    }
  };

  httpServer.app.use(route.post('/login', login));
};

module.exports = loginRoute;
