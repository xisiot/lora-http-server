const route = require('koa-route');
const crypto = require('crypto');
const consts = require('../lora-lib/constants');
const utils = require('../lora-lib/utils');
const code = require('../lora-lib/utils/code.js');
const CusValidator = require('../lora-lib/utils/validator.js');
const userRoute = (httpServer) => {
  var validator = new CusValidator('user');
  /**
    @api {post} /user register
    @apiName user
    @apiGroup User
    @apiParam (body) {String} email User's email
    @apiParam (body) {String} password User's password
    @apiParamExample {json} Request-Example:
    POST http://10.3.242.235:3005/user
    request.body = {
      password: "123456",
      email: "xuke@qq.com"
    }
    @apiSuccess {Number} code HTTP status Code
    @apiSuccess {String} userID User's ID.
    @apiErrorExample Error-Response:：user already registered
    response.body = {
      code: 3101,
      message: 'user already registered'
    };
 */

  const user = async ctx => {
    const body = ctx.request.body;
    const validateQuery = {
      email: body.email,
      password: body.password,
    };
    let validation = validator.validate(validateQuery, 'register');
    if (!validation.result) {
      if (validation.type === 'invalid') {
        ctx.response.body = code.invParam[validation.param];
        return;
      } else if (validation.type === 'required') {
        ctx.response.body = code.requiredParam[validation.param];
        return;
      }
    }
    const md5 = crypto.createHash(consts.HASH_METHOD);
    const query = {
      ...validateQuery,
      developer_id: md5.update(body.email).digest('hex'),
      name: body.email,
      time: Date.now() / 1000
    };
    try {
      await httpServer.mysqlConn.Developers.createItem(query);
      ctx.response.body = code.success;
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        ctx.response.body = code.registeredUser;
      } else {
        ctx.response.body = {
          message: error.message
        };
      }
    }
  };
  httpServer.app.use(route.post('/user', user));
};

module.exports = userRoute;
