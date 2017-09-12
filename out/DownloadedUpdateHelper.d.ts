import { VersionInfo } from "electron-builder-http/out/updateInfo";
import { FileInfo } from "./main";
/** @private **/
export declare class DownloadedUpdateHelper {
    private setupPath;
    private versionInfo;
    private fileInfo;
    readonly file: string | null;
    getDownloadedFile(versionInfo: VersionInfo, fileInfo: FileInfo): string | null;
    setDownloadedFile(file: string, versionInfo: VersionInfo, fileInfo: FileInfo): void;
    clear(): void;
}
