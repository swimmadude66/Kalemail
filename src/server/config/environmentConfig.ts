export interface ForwardServer {
    host: string;
    port: number;
    secure?: boolean;
    auth?: {
        user: string;
        pass: string;
    };
}

export interface EnvironmentConfig {
    environment: string;
    httpport: number;
    smtpport: number;
    log_level: string;
    forwardAddress?: ForwardServer;
    https: boolean;
    fileSystemStorageRoot?: string;
    s3AccessKey?: string;
    s3SecretKey?: string;
    s3Region?: string;
    s3Bucket?: string;
    s3Folder?: string;
    emailOnAcidApiKey?: string;
    emailOnAcidPass?: string;
}
