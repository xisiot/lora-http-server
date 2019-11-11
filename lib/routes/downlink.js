const route = require('koa-route');
const consts = require('../lora-lib/constants');
const utils = require('../lora-lib/utils');
const downlinkRoute = (httpServer) => {
  const downlink = async ctx => {
    const body = ctx.request.body;
    if (!body.DevAddr) {
      ctx.response.body = {
        code: 3112,
        message: 'DevAddr required'
      };
    } else if (!body.Downlink) {
      ctx.response.body = {
        code: 3114,
        message: 'Downlink required'
      };
    } else {
      const query = {
        DevAddr: body.DevAddr,
        Downlink: body.Downlink,
      };
      if (query.DevAddr.length !== consts.DEVADDR_LEN * 2) {
        ctx.response.body = {
          code: 2107,
          message: 'invalid DevAddr'
        };
      } else if (query.Downlink.length === 0) {
        ctx.response.body = {
          code: 2109,
          message: 'invalid Downlink'
        };
      } else {
        const msgQueKey = consts.DOWNLINK_MQ_PREFIX + query.DevAddr;
        try {
          await httpServer.redisConnMsgQue.produceByHTTP(msgQueKey, query.Downlink)
            .then(() => {
              ctx.response.body = {
                code: 200,
                message: 'success'
              };
            });
        } catch (error) {
          ctx.response.body = {
            'message': error.message
          };
        }
      }
    }
  };
  httpServer.app.use(route.post('/downlink', downlink));
};

module.exports = downlinkRoute;
