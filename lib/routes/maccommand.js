const route = require('koa-route');
const consts = require('../lora-lib/constants');
const utils = require('../lora-lib/utils');
const maccommandRoute = (httpServer) => {
  const maccommand = async ctx => {
    const body = ctx.request.body;
    if (!body.DevAddr) {
      ctx.response.body = {
        code: 3112,
        message: 'DevAddr required'
      };
    } else if (!body.MACCommand) {
      ctx.response.body = {
        code: 3113,
        message: 'MACCommand required'
      };
    } else {
      const query = {
        DevAddr: body.DevAddr,
        MACCommand: body.MACCommand,
      };
      if (query.DevAddr.length !== consts.DEVADDR_LEN * 2) {
        ctx.response.body = {
          code: 2107,
          message: 'invalid DevAddr'
        };
      } else if (query.MACCommand.length < 2 || query.MACCommand.length > 12) {
        ctx.response.body = {
          code: 2108,
          message: 'invalid MACCommand'
        };
      } else {
        const mqKey = consts.MACCMDQUEREQ_PREFIX + query.DevAddr;
        const output = utils.maccommandIssuer(query.MACCommand);
        if (JSON.stringify(output) === '{}') {
          ctx.response.body = {
            code: 2108,
            message: 'invalid MACCommand, payload not exist'
          };
        } else if (output.hasOwnProperty('code')) {
          ctx.response.body = {
            code: 2108,
            message: 'invalid MACCommand, ' + output.message
          };
        } else {
          try {
            await httpServer.DownlinkCmdQueue.produce(mqKey, output)
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
    }
  };
  httpServer.app.use(route.post('/maccommand', maccommand));
}

module.exports = maccommandRoute;
