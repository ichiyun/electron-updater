import { HttpExecutor } from "electron-builder-http";
import { GenericServerOptions } from "electron-builder-http/out/publishOptions";
import { UpdateInfo } from "electron-builder-http/out/updateInfo";
import { FileInfo, Provider } from "./main";
export declare class GenericProvider extends Provider<UpdateInfo> {
    private readonly configuration;
    private readonly executor;
    private readonly baseUrl;
    private readonly channel;
    constructor(configuration: GenericServerOptions, executor: HttpExecutor<any>);
    getLatestVersion(): Promise<UpdateInfo>;
    getUpdateFile(versionInfo: UpdateInfo): Promise<FileInfo>;
}
