"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.NoOpLogger = exports.AppUpdater = undefined;

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

var _bluebirdLst2;

function _load_bluebirdLst2() {
    return _bluebirdLst2 = _interopRequireDefault(require("bluebird-lst"));
}

var _crypto;

function _load_crypto() {
    return _crypto = require("crypto");
}

var _electronBuilderHttp;

function _load_electronBuilderHttp() {
    return _electronBuilderHttp = require("electron-builder-http");
}

var _publishOptions;

function _load_publishOptions() {
    return _publishOptions = require("electron-builder-http/out/publishOptions");
}

var _events;

function _load_events() {
    return _events = require("events");
}

var _fsExtraP;

function _load_fsExtraP() {
    return _fsExtraP = require("fs-extra-p");
}

var _jsYaml;

function _load_jsYaml() {
    return _jsYaml = require("js-yaml");
}

var _lazyVal;

function _load_lazyVal() {
    return _lazyVal = require("lazy-val");
}

var _path = _interopRequireWildcard(require("path"));

var _semver;

function _load_semver() {
    return _semver = require("semver");
}

require("source-map-support/register");

var _uuid;

function _load_uuid() {
    return _uuid = _interopRequireWildcard(require("uuid-1345"));
}

var _BintrayProvider;

function _load_BintrayProvider() {
    return _BintrayProvider = require("./BintrayProvider");
}

var _electronHttpExecutor;

function _load_electronHttpExecutor() {
    return _electronHttpExecutor = require("./electronHttpExecutor");
}

var _GenericProvider;

function _load_GenericProvider() {
    return _GenericProvider = require("./GenericProvider");
}

var _GitHubProvider;

function _load_GitHubProvider() {
    return _GitHubProvider = require("./GitHubProvider");
}

var _main;

function _load_main() {
    return _main = require("./main");
}

var _PrivateGitHubProvider;

function _load_PrivateGitHubProvider() {
    return _PrivateGitHubProvider = require("./PrivateGitHubProvider");
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class AppUpdater extends (_events || _load_events()).EventEmitter {
    constructor(options, app) {
        super();
        /**
         * Whether to automatically download an update when it is found.
         */
        this.autoDownload = true;
        /**
         * *GitHub provider only.* Whether to allow update to pre-release versions. Defaults to `true` if application version contains prerelease components (e.g. `0.12.1-alpha.1`, here `alpha` is a prerelease component), otherwise `false`.
         *
         * If `true`, downgrade will be allowed (`allowDowngrade` will be set to `true`).
         */
        this.allowPrerelease = false;
        /**
         * Whether to allow version downgrade (when a user from the beta channel wants to go back to the stable channel).
         * @default false
         */
        this.allowDowngrade = false;
        this._logger = console;
        /**
         * For type safety you can use signals, e.g. `autoUpdater.signals.updateDownloaded(() => {})` instead of `autoUpdater.on('update-available', () => {})`
         */
        this.signals = new (_main || _load_main()).UpdaterSignal(this);
        this.updateAvailable = false;
        this.stagingUserIdPromise = new (_lazyVal || _load_lazyVal()).Lazy(() => this.getOrCreateStagingUserId());
        this.configOnDisk = new (_lazyVal || _load_lazyVal()).Lazy(() => this.loadUpdateConfig());
        this.on("error", error => {
            this._logger.error(`Error: ${error.stack || error.message}`);
        });
        if (app != null || global.__test_app != null) {
            this.app = app || global.__test_app;
            this.untilAppReady = (_bluebirdLst2 || _load_bluebirdLst2()).default.resolve();
        } else {
            this.app = require("electron").app;
            this.httpExecutor = new (_electronHttpExecutor || _load_electronHttpExecutor()).ElectronHttpExecutor((authInfo, callback) => this.emit("login", authInfo, callback));
            this.untilAppReady = new (_bluebirdLst2 || _load_bluebirdLst2()).default(resolve => {
                if (this.app.isReady()) {
                    this._logger.info("App is ready");
                    resolve();
                } else {
                    this._logger.info("Wait for app ready");
                    this.app.on("ready", resolve);
                }
            });
        }
        const currentVersionString = this.app.getVersion();
        this.currentVersion = (0, (_semver || _load_semver()).valid)(currentVersionString);
        if (this.currentVersion == null) {
            throw new Error(`App version is not valid semver version: "${currentVersionString}`);
        }
        this.allowPrerelease = hasPrereleaseComponents(this.currentVersion);
        if (options != null) {
            this.setFeedURL(options);
        }
    }
    /**
     * The logger. You can pass [electron-log](https://github.com/megahertz/electron-log), [winston](https://github.com/winstonjs/winston) or another logger with the following interface: `{ info(), warn(), error() }`.
     * Set it to `null` if you would like to disable a logging feature.
     */
    get logger() {
        return this._logger;
    }
    set logger(value) {
        this._logger = value == null ? new NoOpLogger() : value;
    }
    /**
     * test only
     * @private
     */
    set updateConfigPath(value) {
        this.clientPromise = null;
        this._appUpdateConfigPath = value;
        this.configOnDisk = new (_lazyVal || _load_lazyVal()).Lazy(() => this.loadUpdateConfig());
    }
    //noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
    getFeedURL() {
        return "Deprecated. Do not use it.";
    }
    /**
     * Configure update provider. If value is `string`, {@link module:electron-builder-http/out/publishOptions.GenericServerOptions} will be set with value as `url`.
     * @param options If you want to override configuration in the `app-update.yml`.
     */
    setFeedURL(options) {
        // https://github.com/electron-userland/electron-builder/issues/1105
        let client;
        if (typeof options === "string") {
            client = new (_GenericProvider || _load_GenericProvider()).GenericProvider({ provider: "generic", url: options }, this.httpExecutor);
        } else {
            client = this.createClient(options);
        }
        this.clientPromise = (_bluebirdLst2 || _load_bluebirdLst2()).default.resolve(client);
    }
    /**
     * Asks the server whether there is an update.
     */
    checkForUpdates() {
        let checkForUpdatesPromise = this.checkForUpdatesPromise;
        if (checkForUpdatesPromise != null) {
            return checkForUpdatesPromise;
        }
        checkForUpdatesPromise = this._checkForUpdates();
        this.checkForUpdatesPromise = checkForUpdatesPromise;
        const nullizePromise = () => this.checkForUpdatesPromise = null;
        checkForUpdatesPromise.then(nullizePromise).catch(nullizePromise);
        return checkForUpdatesPromise;
    }
    isStagingMatch(updateInfo) {
        var _this = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            const rawStagingPercentage = updateInfo.stagingPercentage;
            let stagingPercentage = rawStagingPercentage;
            if (stagingPercentage == null) {
                return true;
            }
            stagingPercentage = parseInt(stagingPercentage, 10);
            if (isNaN(stagingPercentage)) {
                _this._logger.warn(`Staging percentage is NaN: ${rawStagingPercentage}`);
                return true;
            }
            // convert from user 0-100 to internal 0-1
            stagingPercentage = stagingPercentage / 100;
            const stagingUserId = yield _this.stagingUserIdPromise.value;
            const val = (_uuid || _load_uuid()).parse(stagingUserId).readUInt32BE(12);
            const percentage = val / 0xFFFFFFFF;
            _this._logger.info(`Staging percentage: ${stagingPercentage}, percentage: ${percentage}, user id: ${stagingUserId}`);
            return percentage < stagingPercentage;
        })();
    }
    _checkForUpdates() {
        var _this2 = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            try {
                yield _this2.untilAppReady;
                _this2._logger.info("Checking for update");
                _this2.emit("checking-for-update");
                return yield _this2.doCheckForUpdates();
            } catch (e) {
                _this2.emit("error", e, `Cannot check for updates: ${(e.stack || e).toString()}`);
                throw e;
            }
        })();
    }
    doCheckForUpdates() {
        var _this3 = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            if (_this3.clientPromise == null) {
                _this3.clientPromise = _this3.configOnDisk.value.then(function (it) {
                    return _this3.createClient(it);
                });
            }
            const client = yield _this3.clientPromise;
            const stagingUserId = yield _this3.stagingUserIdPromise.value;
            client.setRequestHeaders(Object.assign({ "X-User-Staging-Id": stagingUserId }, _this3.requestHeaders));
            const versionInfo = yield client.getLatestVersion();
            const latestVersion = (0, (_semver || _load_semver()).valid)(versionInfo.version);
            if (latestVersion == null) {
                throw new Error(`Latest version (from update server) is not valid semver version: "${latestVersion}`);
            }
            const isStagingMatch = yield _this3.isStagingMatch(versionInfo);
            if (!isStagingMatch || (_this3.allowDowngrade && !hasPrereleaseComponents(latestVersion) ? (0, (_semver || _load_semver()).eq)(latestVersion, _this3.currentVersion) : !(0, (_semver || _load_semver()).gt)(latestVersion, _this3.currentVersion))) {
                _this3.updateAvailable = false;
                _this3._logger.info(`Update for version ${_this3.currentVersion} is not available (latest version: ${versionInfo.version}, downgrade is ${_this3.allowDowngrade ? "allowed" : "disallowed"}.`);
                _this3.emit("update-not-available", versionInfo);
                return {
                    versionInfo
                };
            }
            const fileInfo = yield client.getUpdateFile(versionInfo);
            _this3.updateAvailable = true;
            _this3.versionInfo = versionInfo;
            _this3.fileInfo = fileInfo;
            _this3.onUpdateAvailable(versionInfo, fileInfo);
            const cancellationToken = new (_electronBuilderHttp || _load_electronBuilderHttp()).CancellationToken();
            //noinspection ES6MissingAwait
            return {
                versionInfo,
                fileInfo,
                cancellationToken,
                downloadPromise: _this3.autoDownload ? _this3.downloadUpdate(cancellationToken) : null
            };
        })();
    }
    onUpdateAvailable(versionInfo, fileInfo) {
        this._logger.info(`Found version ${versionInfo.version} (url: ${fileInfo.url})`);
        this.emit("update-available", versionInfo);
    }
    /**
     * Start downloading update manually. You can use this method if `autoDownload` option is set to `false`.
     * @returns {Promise<string>} Path to downloaded file.
     */
    downloadUpdate() {
        var _this4 = this;

        let cancellationToken = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new (_electronBuilderHttp || _load_electronBuilderHttp()).CancellationToken();
        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            const versionInfo = _this4.versionInfo;
            const fileInfo = _this4.fileInfo;
            if (versionInfo == null || fileInfo == null) {
                const message = "Please check update first";
                const error = new Error(message);
                _this4.emit("error", error, message);
                throw error;
            }
            _this4._logger.info(`Downloading update from ${fileInfo.url}`);
            try {
                return yield _this4.doDownloadUpdate(versionInfo, fileInfo, cancellationToken);
            } catch (e) {
                _this4.dispatchError(e);
                throw e;
            }
        })();
    }
    dispatchError(e) {
        this.emit("error", e, (e.stack || e).toString());
    }
    loadUpdateConfig() {
        var _this5 = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            if (_this5._appUpdateConfigPath == null) {
                _this5._appUpdateConfigPath = require("electron-is-dev") ? _path.join(_this5.app.getAppPath(), "dev-app-update.yml") : _path.join(process.resourcesPath, "app-update.yml");
            }
            return (0, (_jsYaml || _load_jsYaml()).safeLoad)((yield (0, (_fsExtraP || _load_fsExtraP()).readFile)(_this5._appUpdateConfigPath, "utf-8")));
        })();
    }
    /*** @private */
    computeRequestHeaders(fileInfo) {
        const requestHeaders = this.requestHeaders;
        if (fileInfo.headers != null) {
            return requestHeaders == null ? fileInfo.headers : Object.assign({}, fileInfo.headers, requestHeaders);
        }
        return Object.assign({ Accept: "*/*" }, requestHeaders);
    }
    createClient(data) {
        if (typeof data === "string") {
            throw new Error("Please pass PublishConfiguration object");
        }
        const provider = data.provider;
        switch (provider) {
            case "github":
                const githubOptions = data;
                const token = (githubOptions.private ? process.env.GH_TOKEN : null) || githubOptions.token;
                if (token == null) {
                    return new (_GitHubProvider || _load_GitHubProvider()).GitHubProvider(githubOptions, this, this.httpExecutor);
                } else {
                    return new (_PrivateGitHubProvider || _load_PrivateGitHubProvider()).PrivateGitHubProvider(githubOptions, token, this.httpExecutor);
                }
            case "s3":
                {
                    const s3 = data;
                    return new (_GenericProvider || _load_GenericProvider()).GenericProvider({
                        provider: "generic",
                        url: (0, (_publishOptions || _load_publishOptions()).s3Url)(s3),
                        channel: s3.channel || ""
                    }, this.httpExecutor);
                }
            case "generic":
                return new (_GenericProvider || _load_GenericProvider()).GenericProvider(data, this.httpExecutor);
            case "bintray":
                return new (_BintrayProvider || _load_BintrayProvider()).BintrayProvider(data, this.httpExecutor);
            default:
                throw new Error(`Unsupported provider: ${provider}`);
        }
    }
    getOrCreateStagingUserId() {
        var _this6 = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            const file = _path.join(_this6.app.getPath("userData"), ".updaterId");
            try {
                const id = yield (0, (_fsExtraP || _load_fsExtraP()).readFile)(file, "utf-8");
                if ((_uuid || _load_uuid()).check(id)) {
                    return id;
                } else {
                    _this6._logger.warn(`Staging user id file exists, but content was invalid: ${id}`);
                }
            } catch (e) {
                if (e.code !== "ENOENT") {
                    _this6._logger.warn(`Couldn't read staging user ID, creating a blank one: ${e}`);
                }
            }
            const id = (_uuid || _load_uuid()).v5({ name: (0, (_crypto || _load_crypto()).randomBytes)(4096), namespace: (_uuid || _load_uuid()).namespace.oid });
            _this6._logger.info(`Generated new staging user ID: ${id}`);
            try {
                yield (0, (_fsExtraP || _load_fsExtraP()).outputFile)(file, id);
            } catch (e) {
                _this6._logger.warn(`Couldn't write out staging user ID: ${e}`);
            }
            return id;
        })();
    }
}
exports.AppUpdater = AppUpdater;
function hasPrereleaseComponents(version) {
    const versionPrereleaseComponent = (0, (_semver || _load_semver()).prerelease)(version);
    return versionPrereleaseComponent != null && versionPrereleaseComponent.length > 0;
}
/** @private */
class NoOpLogger {
    info(message) {
        // ignore
    }
    warn(message) {
        // ignore
    }
    error(message) {
        // ignore
    }
}
exports.NoOpLogger = NoOpLogger; //# sourceMappingURL=AppUpdater.js.map