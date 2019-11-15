const crypto = require('crypto');
// const consts = require('../lib/lora-lib/constants');
// const utils = require('../lib/lora-lib/utils');
const Koa = require('koa');
const fs = require('fs');
// const route = require('koa-route');
const serve = require('koa-static');
const path = require('path');
const bodyParser = require('koa-bodyparser');
const cors = require('koa-cors');
const morgan = require('koa-morgan');
// const net = require('net');
const routes = require('./routes');
const home = serve(path.resolve(__dirname, '../public'));
const accessLogStream = fs.createWriteStream(path.resolve(__dirname, '../access.log'), {
  flags: 'a'
});
const HttpServer = class {
  constructor(dbModels, log, mqClient) {
    this.log = log;
    this.dbModels = dbModels;
    this.mqClient = mqClient;
    this.mysqlConn = this.dbModels.mysqlConn;
    this.redisConn = this.dbModels.redisConn;
    this.createDB = this.dbModels.createDB;
    this._mongoose = this.dbModels._mongoose;
    this.Developers = this.mysqlConn.Developers;
    this.AppInfo = this.mysqlConn.AppInfo;
    this.DeviceInfo = this.mysqlConn.DeviceInfo;
    this.DeviceConfig = this.mysqlConn.DeviceConfig;
    this.GatewayInfo = this.mysqlConn.GatewayInfo;
    this.GatewayStatus = this.mysqlConn.GatewayStatus;
    this.AppInfoTest = this.mysqlConn.AppInfoTest;
    this.DownlinkCmdQueue = this.redisConn.DownlinkCmdQueue;
    this.redisConnMsgQue = this.redisConn.MessageQueue;
    this.app = new Koa();

    this.AppInfoTest = this.mysqlConn.AppInfoTest;
    this.ProtoBuf = this.mysqlConn.ProtoBuf;
    this.App2PB = this.mysqlConn.App2PB;
  }

  bind(config) {
    this.config = config;
    this.app.use(home);
    this.app.use(bodyParser());
    this.app.use(morgan('combined', {
      stream: accessLogStream
    }));
    this.app.use(cors());

    routes.user(this);
    routes.login(this);
    routes.application(this);
    routes.device(this);
    routes.gateway(this);
    routes.maccommand(this);
    routes.downlink(this);
    // this.user();
    // this.login();
    // this.application();
    // this.device();
    // this.gateway();
    // this.maccommand();
    // this.downlink();
    this.app.listen(this.config.http.port);
  }
};

module.exports = HttpServer;
