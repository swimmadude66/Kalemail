import {MailService} from '../services/mail';
import {EnvironmentConfig} from './environmentConfig';
import { DatabaseService } from '../services/db';

export interface AppConfig {
    EnvironmentConfig: EnvironmentConfig;
    MailService: MailService;
    Database: DatabaseService;
}
