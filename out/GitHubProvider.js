"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.GitHubProvider = exports.BaseGitHubProvider = undefined;

var _bluebirdLst;

function _load_bluebirdLst() {
    return _bluebirdLst = require("bluebird-lst");
}

var _electronBuilderHttp;

function _load_electronBuilderHttp() {
    return _electronBuilderHttp = require("electron-builder-http");
}

var _publishOptions;

function _load_publishOptions() {
    return _publishOptions = require("electron-builder-http/out/publishOptions");
}

var _jsYaml;

function _load_jsYaml() {
    return _jsYaml = require("js-yaml");
}

var _path = _interopRequireWildcard(require("path"));

var _url;

function _load_url() {
    return _url = require("url");
}

var _main;

function _load_main() {
    return _main = require("./main");
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class BaseGitHubProvider extends (_main || _load_main()).Provider {
    constructor(options, baseHost) {
        super();
        this.options = options;
        const baseUrl = (0, (_url || _load_url()).parse)(`${options.protocol || "https"}://${options.host || baseHost}`);
        this.baseUrl = {
            protocol: baseUrl.protocol,
            hostname: baseUrl.hostname,
            port: baseUrl.port
        };
    }
}
exports.BaseGitHubProvider = BaseGitHubProvider;
class GitHubProvider extends BaseGitHubProvider {
    constructor(options, updater, executor) {
        super(options, "github.com");
        this.options = options;
        this.updater = updater;
        this.executor = executor;
    }
    getLatestVersion() {
        var _this = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            const basePath = _this.basePath;
            const cancellationToken = new (_electronBuilderHttp || _load_electronBuilderHttp()).CancellationToken();
            const xElement = require("xelement");
            const feedXml = yield _this.executor.request(Object.assign({ path: `${basePath}.atom`, headers: Object.assign({}, _this.requestHeaders, { Accept: "application/xml, application/atom+xml, text/xml, */*" }) }, _this.baseUrl), cancellationToken);
            const feed = new xElement.Parse(feedXml);
            const latestRelease = feed.element("entry");
            if (latestRelease == null) {
                throw new Error(`No published versions on GitHub`);
            }
            let version;
            try {
                if (_this.updater.allowPrerelease) {
                    version = latestRelease.element("link").getAttr("href").match(/\/tag\/v?([^\/]+)$/)[1];
                } else {
                    version = yield _this.getLatestVersionString(basePath, cancellationToken);
                }
            } catch (e) {
                throw new Error(`Cannot parse releases feed: ${e.stack || e.message},\nXML:\n${feedXml}`);
            }
            if (version == null) {
                throw new Error(`No published versions on GitHub`);
            }
            let result;
            const channelFile = (0, (_main || _load_main()).getChannelFilename)((0, (_main || _load_main()).getDefaultChannelName)());
            const requestOptions = Object.assign({ path: _this.getBaseDownloadPath(version, channelFile), headers: _this.requestHeaders || undefined }, _this.baseUrl);
            let rawData;
            try {
                rawData = yield _this.executor.request(requestOptions, cancellationToken);
            } catch (e) {
                if (!_this.updater.allowPrerelease) {
                    if (e instanceof (_electronBuilderHttp || _load_electronBuilderHttp()).HttpError && e.response.statusCode === 404) {
                        throw new Error(`Cannot find ${channelFile} in the latest release artifacts (${(0, (_main || _load_main()).formatUrl)(requestOptions)}): ${e.stack || e.message}`);
                    }
                }
                throw e;
            }
            try {
                result = (0, (_jsYaml || _load_jsYaml()).safeLoad)(rawData);
            } catch (e) {
                throw new Error(`Cannot parse update info from ${channelFile} in the latest release artifacts (${(0, (_main || _load_main()).formatUrl)(requestOptions)}): ${e.stack || e.message}, rawData: ${rawData}`);
            }
            (_main || _load_main()).Provider.validateUpdateInfo(result);
            if ((0, (_main || _load_main()).isUseOldMacProvider)()) {
                result.releaseJsonUrl = `${(0, (_publishOptions || _load_publishOptions()).githubUrl)(_this.options)}/${requestOptions.path}`;
            }
            if (result.releaseName == null) {
                result.releaseName = latestRelease.getElementValue("title");
            }
            if (result.releaseNotes == null) {
                result.releaseNotes = latestRelease.getElementValue("content");
            }
            return result;
        })();
    }
    getLatestVersionString(basePath, cancellationToken) {
        var _this2 = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            const requestOptions = Object.assign({ path: `${basePath}/latest`, headers: Object.assign({}, _this2.requestHeaders, { Accept: "application/json" }) }, _this2.baseUrl);
            try {
                // do not use API to avoid limit
                const rawData = yield _this2.executor.request(requestOptions, cancellationToken);
                if (rawData == null) {
                    return null;
                }
                const releaseInfo = JSON.parse(rawData);
                return releaseInfo.tag_name.startsWith("v") ? releaseInfo.tag_name.substring(1) : releaseInfo.tag_name;
            } catch (e) {
                throw new Error(`Unable to find latest version on GitHub (${(0, (_main || _load_main()).formatUrl)(requestOptions)}), please ensure a production release exists: ${e.stack || e.message}`);
            }
        })();
    }
    get basePath() {
        return `/${this.options.owner}/${this.options.repo}/releases`;
    }
    getUpdateFile(versionInfo) {
        var _this3 = this;

        return (0, (_bluebirdLst || _load_bluebirdLst()).coroutine)(function* () {
            if ((0, (_main || _load_main()).isUseOldMacProvider)()) {
                return versionInfo;
            }
            // space is not supported on GitHub
            const name = versionInfo.githubArtifactName || _path.posix.basename(versionInfo.path).replace(/ /g, "-");
            return {
                name,
                url: (0, (_main || _load_main()).formatUrl)(Object.assign({ path: _this3.getBaseDownloadPath(versionInfo.version, name) }, _this3.baseUrl)),
                sha2: versionInfo.sha2,
                sha512: versionInfo.sha512
            };
        })();
    }
    getBaseDownloadPath(version, fileName) {
        return `${this.basePath}/download/${this.options.vPrefixedTagName === false ? "" : "v"}${version}/${fileName}`;
    }
}
exports.GitHubProvider = GitHubProvider; //# sourceMappingURL=GitHubProvider.js.map