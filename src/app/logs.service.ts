import { Injectable } from '@angular/core';
// import { configure, getLogger } from 'log4js';

@Injectable({
  providedIn: 'root'
})
export class LogsService {

  constructor() { }

 /*/ public logProcess( logdataapi: any, filename: any ) {
    const currentDate = new Date().toISOString().slice(0,10);
    // tslint:disable-next-line: variable-name
    const file_name = 'logs/' + filename + '-' + currentDate + '.log';

    configure({
      appenders: { logs: { type: 'file', filename: file_name ,pattern: '.yyyy-MM-dd-hh' } },
      categories: { default: { appenders: ['logs'], level: 'info' } }
  });

    const logger = getLogger('logs');
    logger.info(logdataapi);
  } */
}
