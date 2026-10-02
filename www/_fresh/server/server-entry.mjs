var __defProp = Object.defineProperty;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var _internal, _buildCache, _additionalStyles, _getBuildCache, _commands, _onError, _a;
function checkWindows() {
  const global2 = globalThis;
  const platform = global2.process?.platform;
  if (typeof platform === "string") return platform.startsWith("win");
  const os = global2.Deno?.build?.os;
  if (typeof os === "string") return os === "windows";
  return global2.navigator?.platform?.startsWith("Win") ?? false;
}
const isWindows$1 = checkWindows();
function assertPath$1(path) {
  if (typeof path !== "string") {
    throw new TypeError(`Path must be a string, received "${JSON.stringify(path)}"`);
  }
}
function assertArg$2(url) {
  url = url instanceof URL ? url : new URL(url);
  if (url.protocol !== "file:") {
    throw new TypeError(`URL must be a file URL: received "${url.protocol}"`);
  }
  return url;
}
function fromFileUrl$2(url) {
  url = assertArg$2(url);
  return decodeURIComponent(url.pathname.replace(/%(?![0-9A-Fa-f]{2})/g, "%25"));
}
const CHAR_UPPERCASE_A$1 = 65;
const CHAR_LOWERCASE_A$1 = 97;
const CHAR_UPPERCASE_Z$1 = 90;
const CHAR_LOWERCASE_Z$1 = 122;
const CHAR_DOT$1 = 46;
const CHAR_FORWARD_SLASH$1 = 47;
const CHAR_BACKWARD_SLASH$1 = 92;
const CHAR_COLON$1 = 58;
function isPosixPathSeparator$1(code2) {
  return code2 === CHAR_FORWARD_SLASH$1;
}
function isPathSeparator$1(code2) {
  return code2 === CHAR_FORWARD_SLASH$1 || code2 === CHAR_BACKWARD_SLASH$1;
}
function isWindowsDeviceRoot$1(code2) {
  return code2 >= CHAR_LOWERCASE_A$1 && code2 <= CHAR_LOWERCASE_Z$1 || code2 >= CHAR_UPPERCASE_A$1 && code2 <= CHAR_UPPERCASE_Z$1;
}
function fromFileUrl$1(url) {
  url = assertArg$2(url);
  let path = decodeURIComponent(url.pathname.replace(/\//g, "\\").replace(/%(?![0-9A-Fa-f]{2})/g, "%25")).replace(/^\\*([A-Za-z]:)(\\|$)/, "$1\\");
  if (url.hostname !== "") {
    path = `\\\\${url.hostname}${path}`;
  }
  return path;
}
function fromFileUrl(url) {
  return isWindows$1 ? fromFileUrl$1(url) : fromFileUrl$2(url);
}
function isAbsolute$2(path) {
  assertPath$1(path);
  return path.length > 0 && isPosixPathSeparator$1(path.charCodeAt(0));
}
function isAbsolute$1(path) {
  assertPath$1(path);
  const len = path.length;
  if (len === 0) return false;
  const code2 = path.charCodeAt(0);
  if (isPathSeparator$1(code2)) {
    return true;
  } else if (isWindowsDeviceRoot$1(code2)) {
    if (len > 2 && path.charCodeAt(1) === CHAR_COLON$1) {
      if (isPathSeparator$1(path.charCodeAt(2))) return true;
    }
  }
  return false;
}
function isAbsolute(path) {
  return isWindows$1 ? isAbsolute$1(path) : isAbsolute$2(path);
}
function assertArg$1(path) {
  assertPath$1(path);
  if (path.length === 0) return ".";
}
function normalizeString$1(path, allowAboveRoot, separator, isPathSeparator2) {
  let res = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let code2;
  for (let i2 = 0; i2 <= path.length; ++i2) {
    if (i2 < path.length) code2 = path.charCodeAt(i2);
    else if (isPathSeparator2(code2)) break;
    else code2 = CHAR_FORWARD_SLASH$1;
    if (isPathSeparator2(code2)) {
      if (lastSlash === i2 - 1 || dots === 1) ;
      else if (lastSlash !== i2 - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== CHAR_DOT$1 || res.charCodeAt(res.length - 2) !== CHAR_DOT$1) {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf(separator);
            if (lastSlashIndex === -1) {
              res = "";
              lastSegmentLength = 0;
            } else {
              res = res.slice(0, lastSlashIndex);
              lastSegmentLength = res.length - 1 - res.lastIndexOf(separator);
            }
            lastSlash = i2;
            dots = 0;
            continue;
          } else if (res.length === 2 || res.length === 1) {
            res = "";
            lastSegmentLength = 0;
            lastSlash = i2;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0) res += `${separator}..`;
          else res = "..";
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) res += separator + path.slice(lastSlash + 1, i2);
        else res = path.slice(lastSlash + 1, i2);
        lastSegmentLength = i2 - lastSlash - 1;
      }
      lastSlash = i2;
      dots = 0;
    } else if (code2 === CHAR_DOT$1 && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}
function normalize$3(path) {
  if (path instanceof URL) {
    path = fromFileUrl$2(path);
  }
  assertArg$1(path);
  const isAbsolute2 = isPosixPathSeparator$1(path.charCodeAt(0));
  const trailingSeparator = isPosixPathSeparator$1(path.charCodeAt(path.length - 1));
  path = normalizeString$1(path, !isAbsolute2, "/", isPosixPathSeparator$1);
  if (path.length === 0 && !isAbsolute2) path = ".";
  if (path.length > 0 && trailingSeparator) path += "/";
  if (isAbsolute2) return `/${path}`;
  return path;
}
function join$5(path, ...paths) {
  if (path === void 0) return ".";
  if (path instanceof URL) {
    path = fromFileUrl$2(path);
  }
  paths = path ? [path, ...paths] : paths;
  paths.forEach((path2) => assertPath$1(path2));
  const joined = paths.filter((path2) => path2.length > 0).join("/");
  return joined === "" ? "." : normalize$3(joined);
}
function normalize$2(path) {
  if (path instanceof URL) {
    path = fromFileUrl$1(path);
  }
  assertArg$1(path);
  const len = path.length;
  let rootEnd = 0;
  let device;
  let isAbsolute2 = false;
  const code2 = path.charCodeAt(0);
  if (len > 1) {
    if (isPathSeparator$1(code2)) {
      isAbsolute2 = true;
      if (isPathSeparator$1(path.charCodeAt(1))) {
        let j2 = 2;
        let last = j2;
        for (; j2 < len; ++j2) {
          if (isPathSeparator$1(path.charCodeAt(j2))) break;
        }
        if (j2 < len && j2 !== last) {
          const firstPart = path.slice(last, j2);
          last = j2;
          for (; j2 < len; ++j2) {
            if (!isPathSeparator$1(path.charCodeAt(j2))) break;
          }
          if (j2 < len && j2 !== last) {
            last = j2;
            for (; j2 < len; ++j2) {
              if (isPathSeparator$1(path.charCodeAt(j2))) break;
            }
            if (j2 === len) {
              return `\\\\${firstPart}\\${path.slice(last)}\\`;
            } else if (j2 !== last) {
              device = `\\\\${firstPart}\\${path.slice(last, j2)}`;
              rootEnd = j2;
            }
          }
        }
      } else {
        rootEnd = 1;
      }
    } else if (isWindowsDeviceRoot$1(code2)) {
      if (path.charCodeAt(1) === CHAR_COLON$1) {
        device = path.slice(0, 2);
        rootEnd = 2;
        if (len > 2) {
          if (isPathSeparator$1(path.charCodeAt(2))) {
            isAbsolute2 = true;
            rootEnd = 3;
          }
        }
      }
    }
  } else if (isPathSeparator$1(code2)) {
    return "\\";
  }
  let tail;
  if (rootEnd < len) {
    tail = normalizeString$1(path.slice(rootEnd), !isAbsolute2, "\\", isPathSeparator$1);
  } else {
    tail = "";
  }
  if (tail.length === 0 && !isAbsolute2) tail = ".";
  if (tail.length > 0 && isPathSeparator$1(path.charCodeAt(len - 1))) {
    tail += "\\";
  }
  if (device === void 0) {
    if (isAbsolute2) {
      if (tail.length > 0) return `\\${tail}`;
      else return "\\";
    }
    return tail;
  } else if (isAbsolute2) {
    if (tail.length > 0) return `${device}\\${tail}`;
    else return `${device}\\`;
  }
  return device + tail;
}
function join$4(path, ...paths) {
  if (path instanceof URL) {
    path = fromFileUrl$1(path);
  }
  paths = path ? [path, ...paths] : paths;
  paths.forEach((path2) => assertPath$1(path2));
  paths = paths.filter((path2) => path2.length > 0);
  if (paths.length === 0) return ".";
  let needsReplace = true;
  let slashCount = 0;
  const firstPart = paths[0];
  if (isPathSeparator$1(firstPart.charCodeAt(0))) {
    ++slashCount;
    const firstLen = firstPart.length;
    if (firstLen > 1) {
      if (isPathSeparator$1(firstPart.charCodeAt(1))) {
        ++slashCount;
        if (firstLen > 2) {
          if (isPathSeparator$1(firstPart.charCodeAt(2))) ++slashCount;
          else {
            needsReplace = false;
          }
        }
      }
    }
  }
  let joined = paths.join("\\");
  if (needsReplace) {
    for (; slashCount < joined.length; ++slashCount) {
      if (!isPathSeparator$1(joined.charCodeAt(slashCount))) break;
    }
    if (slashCount >= 2) joined = `\\${joined.slice(slashCount)}`;
  }
  return normalize$2(joined);
}
function join$3(path, ...paths) {
  return isWindows$1 ? join$4(path, ...paths) : join$5(path, ...paths);
}
function cwd(errorMessage) {
  const global2 = globalThis;
  const getCwd = global2.process?.cwd ?? global2.Deno?.cwd;
  if (typeof getCwd !== "function") {
    throw new TypeError(errorMessage);
  }
  return getCwd();
}
function resolve$4(...pathSegments) {
  let resolvedPath = "";
  let resolvedAbsolute = false;
  for (let i2 = pathSegments.length - 1; i2 >= -1 && !resolvedAbsolute; i2--) {
    let path;
    if (i2 >= 0) path = pathSegments[i2];
    else {
      path = cwd("Resolved a relative path without a current working directory (CWD)");
    }
    assertPath$1(path);
    if (path.length === 0) {
      continue;
    }
    resolvedPath = `${path}/${resolvedPath}`;
    resolvedAbsolute = isPosixPathSeparator$1(path.charCodeAt(0));
  }
  resolvedPath = normalizeString$1(resolvedPath, !resolvedAbsolute, "/", isPosixPathSeparator$1);
  if (resolvedAbsolute) {
    if (resolvedPath.length > 0) return `/${resolvedPath}`;
    else return "/";
  } else if (resolvedPath.length > 0) return resolvedPath;
  else return ".";
}
function assertArgs$1(from, to) {
  assertPath$1(from);
  assertPath$1(to);
  if (from === to) return "";
}
function relative$5(from, to) {
  assertArgs$1(from, to);
  from = resolve$4(from);
  to = resolve$4(to);
  if (from === to) return "";
  let fromStart = 1;
  const fromEnd = from.length;
  for (; fromStart < fromEnd; ++fromStart) {
    if (!isPosixPathSeparator$1(from.charCodeAt(fromStart))) break;
  }
  const fromLen = fromEnd - fromStart;
  let toStart = 1;
  const toEnd = to.length;
  for (; toStart < toEnd; ++toStart) {
    if (!isPosixPathSeparator$1(to.charCodeAt(toStart))) break;
  }
  const toLen = toEnd - toStart;
  const length = fromLen < toLen ? fromLen : toLen;
  let lastCommonSep = -1;
  let i2 = 0;
  for (; i2 <= length; ++i2) {
    if (i2 === length) {
      if (toLen > length) {
        if (isPosixPathSeparator$1(to.charCodeAt(toStart + i2))) {
          return to.slice(toStart + i2 + 1);
        } else if (i2 === 0) {
          return to.slice(toStart + i2);
        }
      } else if (fromLen > length) {
        if (isPosixPathSeparator$1(from.charCodeAt(fromStart + i2))) {
          lastCommonSep = i2;
        } else if (i2 === 0) {
          lastCommonSep = 0;
        }
      }
      break;
    }
    const fromCode = from.charCodeAt(fromStart + i2);
    const toCode = to.charCodeAt(toStart + i2);
    if (fromCode !== toCode) break;
    else if (isPosixPathSeparator$1(fromCode)) lastCommonSep = i2;
  }
  let out = "";
  for (i2 = fromStart + lastCommonSep + 1; i2 <= fromEnd; ++i2) {
    if (i2 === fromEnd || isPosixPathSeparator$1(from.charCodeAt(i2))) {
      if (out.length === 0) out += "..";
      else out += "/..";
    }
  }
  if (out.length > 0) return out + to.slice(toStart + lastCommonSep);
  else {
    toStart += lastCommonSep;
    if (isPosixPathSeparator$1(to.charCodeAt(toStart))) ++toStart;
    return to.slice(toStart);
  }
}
function resolve$3(...pathSegments) {
  let resolvedDevice = "";
  let resolvedTail = "";
  let resolvedAbsolute = false;
  for (let i2 = pathSegments.length - 1; i2 >= -1; i2--) {
    let path;
    if (i2 >= 0) {
      path = pathSegments[i2];
    } else if (!resolvedDevice) {
      path = cwd("Resolved a drive-letter-less path without a current working directory (CWD)");
    } else {
      path = cwd("Resolved a relative path without a current working directory (CWD)");
      if (path === void 0 || path.slice(0, 3).toLowerCase() !== `${resolvedDevice.toLowerCase()}\\`) {
        path = `${resolvedDevice}\\`;
      }
    }
    assertPath$1(path);
    const len = path.length;
    if (len === 0) continue;
    let rootEnd = 0;
    let device = "";
    let isAbsolute2 = false;
    const code2 = path.charCodeAt(0);
    if (len > 1) {
      if (isPathSeparator$1(code2)) {
        isAbsolute2 = true;
        if (isPathSeparator$1(path.charCodeAt(1))) {
          let j2 = 2;
          let last = j2;
          for (; j2 < len; ++j2) {
            if (isPathSeparator$1(path.charCodeAt(j2))) break;
          }
          if (j2 < len && j2 !== last) {
            const firstPart = path.slice(last, j2);
            last = j2;
            for (; j2 < len; ++j2) {
              if (!isPathSeparator$1(path.charCodeAt(j2))) break;
            }
            if (j2 < len && j2 !== last) {
              last = j2;
              for (; j2 < len; ++j2) {
                if (isPathSeparator$1(path.charCodeAt(j2))) break;
              }
              if (j2 === len) {
                device = `\\\\${firstPart}\\${path.slice(last)}`;
                rootEnd = j2;
              } else if (j2 !== last) {
                device = `\\\\${firstPart}\\${path.slice(last, j2)}`;
                rootEnd = j2;
              }
            }
          }
        } else {
          rootEnd = 1;
        }
      } else if (isWindowsDeviceRoot$1(code2)) {
        if (path.charCodeAt(1) === CHAR_COLON$1) {
          device = path.slice(0, 2);
          rootEnd = 2;
          if (len > 2) {
            if (isPathSeparator$1(path.charCodeAt(2))) {
              isAbsolute2 = true;
              rootEnd = 3;
            }
          }
        }
      }
    } else if (isPathSeparator$1(code2)) {
      rootEnd = 1;
      isAbsolute2 = true;
    }
    if (device.length > 0 && resolvedDevice.length > 0 && device.toLowerCase() !== resolvedDevice.toLowerCase()) {
      continue;
    }
    if (resolvedDevice.length === 0 && device.length > 0) {
      resolvedDevice = device;
    }
    if (!resolvedAbsolute) {
      resolvedTail = `${path.slice(rootEnd)}\\${resolvedTail}`;
      resolvedAbsolute = isAbsolute2;
    }
    if (resolvedAbsolute && resolvedDevice.length > 0) break;
  }
  resolvedTail = normalizeString$1(resolvedTail, !resolvedAbsolute, "\\", isPathSeparator$1);
  return resolvedDevice + (resolvedAbsolute ? "\\" : "") + resolvedTail || ".";
}
function relative$4(from, to) {
  assertArgs$1(from, to);
  const fromOrig = resolve$3(from);
  const toOrig = resolve$3(to);
  if (fromOrig === toOrig) return "";
  from = fromOrig.toLowerCase();
  to = toOrig.toLowerCase();
  if (from === to) return "";
  let fromStart = 0;
  let fromEnd = from.length;
  for (; fromStart < fromEnd; ++fromStart) {
    if (from.charCodeAt(fromStart) !== CHAR_BACKWARD_SLASH$1) break;
  }
  for (; fromEnd - 1 > fromStart; --fromEnd) {
    if (from.charCodeAt(fromEnd - 1) !== CHAR_BACKWARD_SLASH$1) break;
  }
  const fromLen = fromEnd - fromStart;
  let toStart = 0;
  let toEnd = to.length;
  for (; toStart < toEnd; ++toStart) {
    if (to.charCodeAt(toStart) !== CHAR_BACKWARD_SLASH$1) break;
  }
  for (; toEnd - 1 > toStart; --toEnd) {
    if (to.charCodeAt(toEnd - 1) !== CHAR_BACKWARD_SLASH$1) break;
  }
  const toLen = toEnd - toStart;
  const length = fromLen < toLen ? fromLen : toLen;
  let lastCommonSep = -1;
  let i2 = 0;
  for (; i2 <= length; ++i2) {
    if (i2 === length) {
      if (toLen > length) {
        if (to.charCodeAt(toStart + i2) === CHAR_BACKWARD_SLASH$1) {
          return toOrig.slice(toStart + i2 + 1);
        } else if (i2 === 2) {
          return toOrig.slice(toStart + i2);
        }
      }
      if (fromLen > length) {
        if (from.charCodeAt(fromStart + i2) === CHAR_BACKWARD_SLASH$1) {
          lastCommonSep = i2;
        } else if (i2 === 2) {
          lastCommonSep = 3;
        }
      }
      break;
    }
    const fromCode = from.charCodeAt(fromStart + i2);
    const toCode = to.charCodeAt(toStart + i2);
    if (fromCode !== toCode) break;
    else if (fromCode === CHAR_BACKWARD_SLASH$1) lastCommonSep = i2;
  }
  if (i2 !== length && lastCommonSep === -1) {
    return toOrig;
  }
  let out = "";
  if (lastCommonSep === -1) lastCommonSep = 0;
  for (i2 = fromStart + lastCommonSep + 1; i2 <= fromEnd; ++i2) {
    if (i2 === fromEnd || from.charCodeAt(i2) === CHAR_BACKWARD_SLASH$1) {
      if (out.length === 0) out += "..";
      else out += "\\..";
    }
  }
  if (out.length > 0) {
    return out + toOrig.slice(toStart + lastCommonSep, toEnd);
  } else {
    toStart += lastCommonSep;
    if (toOrig.charCodeAt(toStart) === CHAR_BACKWARD_SLASH$1) ++toStart;
    return toOrig.slice(toStart, toEnd);
  }
}
function relative$3(from, to) {
  return isWindows$1 ? relative$4(from, to) : relative$5(from, to);
}
var exports$I = {};
Object.defineProperty(exports$I, "__esModule", {
  value: true
});
Object.defineProperty(exports$I, "__esModule", {
  value: true
});
exports$I.VERSION = void 0;
exports$I.VERSION = "1.9.1";
var _VERSION = exports$I.VERSION;
var _default$G;
if (typeof exports$I === "object" && exports$I !== null && "default" in exports$I) {
  _default$G = exports$I.default;
} else {
  _default$G = exports$I;
}
const _default_default$G = _default$G;
var __require$G = exports$I;
exports$I.__esModule;
const _mod$c = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  VERSION: _VERSION,
  __require: __require$G,
  default: _default_default$G
}, Symbol.toStringTag, { value: "Module" }));
var exports$H = {};
Object.defineProperty(exports$H, "__esModule", {
  value: true
});
Object.defineProperty(exports$H, "__esModule", {
  value: true
});
const version_1$1 = __require$G ?? _default_default$G ?? _mod$c;
const re = /^(\d+)\.(\d+)\.(\d+)(-(.+))?$/;
function _makeCompatibilityCheck(ownVersion) {
  const acceptedVersions = /* @__PURE__ */ new Set([ownVersion]);
  const rejectedVersions = /* @__PURE__ */ new Set();
  const myVersionMatch = ownVersion.match(re);
  if (!myVersionMatch) {
    return () => false;
  }
  const ownVersionParsed = {
    major: +myVersionMatch[1],
    minor: +myVersionMatch[2],
    patch: +myVersionMatch[3],
    prerelease: myVersionMatch[4]
  };
  if (ownVersionParsed.prerelease != null) {
    return function isExactmatch(globalVersion) {
      return globalVersion === ownVersion;
    };
  }
  function _reject(v2) {
    rejectedVersions.add(v2);
    return false;
  }
  function _accept(v2) {
    acceptedVersions.add(v2);
    return true;
  }
  return function isCompatible(globalVersion) {
    if (acceptedVersions.has(globalVersion)) {
      return true;
    }
    if (rejectedVersions.has(globalVersion)) {
      return false;
    }
    const globalVersionMatch = globalVersion.match(re);
    if (!globalVersionMatch) {
      return _reject(globalVersion);
    }
    const globalVersionParsed = {
      major: +globalVersionMatch[1],
      minor: +globalVersionMatch[2],
      patch: +globalVersionMatch[3],
      prerelease: globalVersionMatch[4]
    };
    if (globalVersionParsed.prerelease != null) {
      return _reject(globalVersion);
    }
    if (ownVersionParsed.major !== globalVersionParsed.major) {
      return _reject(globalVersion);
    }
    if (ownVersionParsed.major === 0) {
      if (ownVersionParsed.minor === globalVersionParsed.minor && ownVersionParsed.patch <= globalVersionParsed.patch) {
        return _accept(globalVersion);
      }
      return _reject(globalVersion);
    }
    if (ownVersionParsed.minor <= globalVersionParsed.minor) {
      return _accept(globalVersion);
    }
    return _reject(globalVersion);
  };
}
exports$H._makeCompatibilityCheck = _makeCompatibilityCheck;
exports$H.isCompatible = _makeCompatibilityCheck(version_1$1.VERSION);
exports$H._makeCompatibilityCheck;
var _isCompatible = exports$H.isCompatible;
var _default$F;
if (typeof exports$H === "object" && exports$H !== null && "default" in exports$H) {
  _default$F = exports$H.default;
} else {
  _default$F = exports$H;
}
const _default_default$F = _default$F;
var __require$F = exports$H;
exports$H.__esModule;
const _mod2$6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __require: __require$F,
  default: _default_default$F,
  isCompatible: _isCompatible
}, Symbol.toStringTag, { value: "Module" }));
var exports$G = {};
Object.defineProperty(exports$G, "__esModule", {
  value: true
});
Object.defineProperty(exports$G, "__esModule", {
  value: true
});
const version_1 = __require$G ?? _default_default$G ?? _mod$c;
const semver_1 = __require$F ?? _default_default$F ?? _mod2$6;
const major = version_1.VERSION.split(".")[0];
const GLOBAL_OPENTELEMETRY_API_KEY = /* @__PURE__ */ Symbol.for(`opentelemetry.js.api.${major}`);
const _global = typeof globalThis === "object" ? globalThis : typeof self === "object" ? self : typeof window === "object" ? window : typeof global === "object" ? global : {};
function registerGlobal(type, instance, diag2, allowOverride = false) {
  var _a2;
  const api = _global[GLOBAL_OPENTELEMETRY_API_KEY] = (_a2 = _global[GLOBAL_OPENTELEMETRY_API_KEY]) !== null && _a2 !== void 0 ? _a2 : {
    version: version_1.VERSION
  };
  if (!allowOverride && api[type]) {
    const err = new Error(`@opentelemetry/api: Attempted duplicate registration of API: ${type}`);
    diag2.error(err.stack || err.message);
    return false;
  }
  if (api.version !== version_1.VERSION) {
    const err = new Error(`@opentelemetry/api: Registration of version v${api.version} for ${type} does not match previously registered API v${version_1.VERSION}`);
    diag2.error(err.stack || err.message);
    return false;
  }
  api[type] = instance;
  diag2.debug(`@opentelemetry/api: Registered a global for ${type} v${version_1.VERSION}.`);
  return true;
}
exports$G.registerGlobal = registerGlobal;
function getGlobal(type) {
  var _a2, _b;
  const globalVersion = (_a2 = _global[GLOBAL_OPENTELEMETRY_API_KEY]) === null || _a2 === void 0 ? void 0 : _a2.version;
  if (!globalVersion || !(0, semver_1.isCompatible)(globalVersion)) {
    return;
  }
  return (_b = _global[GLOBAL_OPENTELEMETRY_API_KEY]) === null || _b === void 0 ? void 0 : _b[type];
}
exports$G.getGlobal = getGlobal;
function unregisterGlobal(type, diag2) {
  diag2.debug(`@opentelemetry/api: Unregistering a global for ${type} v${version_1.VERSION}.`);
  const api = _global[GLOBAL_OPENTELEMETRY_API_KEY];
  if (api) {
    delete api[type];
  }
}
exports$G.unregisterGlobal = unregisterGlobal;
var _registerGlobal = exports$G.registerGlobal;
var _getGlobal = exports$G.getGlobal;
var _unregisterGlobal = exports$G.unregisterGlobal;
var _default$E;
if (typeof exports$G === "object" && exports$G !== null && "default" in exports$G) {
  _default$E = exports$G.default;
} else {
  _default$E = exports$G;
}
const _default_default$E = _default$E;
var __require$E = exports$G;
exports$G.__esModule;
const _mod2$5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __require: __require$E,
  default: _default_default$E,
  getGlobal: _getGlobal,
  registerGlobal: _registerGlobal,
  unregisterGlobal: _unregisterGlobal
}, Symbol.toStringTag, { value: "Module" }));
var exports$F = {};
Object.defineProperty(exports$F, "__esModule", {
  value: true
});
Object.defineProperty(exports$F, "__esModule", {
  value: true
});
exports$F.DiagLogLevel = void 0;
(function(DiagLogLevel) {
  DiagLogLevel[DiagLogLevel["NONE"] = 0] = "NONE";
  DiagLogLevel[DiagLogLevel["ERROR"] = 30] = "ERROR";
  DiagLogLevel[DiagLogLevel["WARN"] = 50] = "WARN";
  DiagLogLevel[DiagLogLevel["INFO"] = 60] = "INFO";
  DiagLogLevel[DiagLogLevel["DEBUG"] = 70] = "DEBUG";
  DiagLogLevel[DiagLogLevel["VERBOSE"] = 80] = "VERBOSE";
  DiagLogLevel[DiagLogLevel["ALL"] = 9999] = "ALL";
})(exports$F.DiagLogLevel || (exports$F.DiagLogLevel = {}));
var _DiagLogLevel = exports$F.DiagLogLevel;
var _default$D;
if (typeof exports$F === "object" && exports$F !== null && "default" in exports$F) {
  _default$D = exports$F.default;
} else {
  _default$D = exports$F;
}
const _default_default$D = _default$D;
var __require$D = exports$F;
exports$F.__esModule;
const _mod4$2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  DiagLogLevel: _DiagLogLevel,
  __require: __require$D,
  default: _default_default$D
}, Symbol.toStringTag, { value: "Module" }));
var exports$E = {};
Object.defineProperty(exports$E, "__esModule", {
  value: true
});
Object.defineProperty(exports$E, "__esModule", {
  value: true
});
exports$E.createLogLevelDiagLogger = void 0;
const types_1$2 = __require$D ?? _default_default$D ?? _mod4$2;
function createLogLevelDiagLogger(maxLevel, logger) {
  if (maxLevel < types_1$2.DiagLogLevel.NONE) {
    maxLevel = types_1$2.DiagLogLevel.NONE;
  } else if (maxLevel > types_1$2.DiagLogLevel.ALL) {
    maxLevel = types_1$2.DiagLogLevel.ALL;
  }
  logger = logger || {};
  function _filterFunc(funcName, theLevel) {
    const theFunc = logger[funcName];
    if (typeof theFunc === "function" && maxLevel >= theLevel) {
      return theFunc.bind(logger);
    }
    return function() {
    };
  }
  return {
    error: _filterFunc("error", types_1$2.DiagLogLevel.ERROR),
    warn: _filterFunc("warn", types_1$2.DiagLogLevel.WARN),
    info: _filterFunc("info", types_1$2.DiagLogLevel.INFO),
    debug: _filterFunc("debug", types_1$2.DiagLogLevel.DEBUG),
    verbose: _filterFunc("verbose", types_1$2.DiagLogLevel.VERBOSE)
  };
}
exports$E.createLogLevelDiagLogger = createLogLevelDiagLogger;
var _createLogLevelDiagLogger = exports$E.createLogLevelDiagLogger;
var _default$C;
if (typeof exports$E === "object" && exports$E !== null && "default" in exports$E) {
  _default$C = exports$E.default;
} else {
  _default$C = exports$E;
}
const _default_default$C = _default$C;
var __require$C = exports$E;
exports$E.__esModule;
const _mod2$4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __require: __require$C,
  createLogLevelDiagLogger: _createLogLevelDiagLogger,
  default: _default_default$C
}, Symbol.toStringTag, { value: "Module" }));
var exports$D = {};
Object.defineProperty(exports$D, "__esModule", {
  value: true
});
Object.defineProperty(exports$D, "__esModule", {
  value: true
});
exports$D.DiagComponentLogger = void 0;
const global_utils_1$5 = __require$E ?? _default_default$E ?? _mod2$5;
class DiagComponentLogger {
  constructor(props) {
    this._namespace = props.namespace || "DiagComponentLogger";
  }
  debug(...args) {
    return logProxy("debug", this._namespace, args);
  }
  error(...args) {
    return logProxy("error", this._namespace, args);
  }
  info(...args) {
    return logProxy("info", this._namespace, args);
  }
  warn(...args) {
    return logProxy("warn", this._namespace, args);
  }
  verbose(...args) {
    return logProxy("verbose", this._namespace, args);
  }
}
exports$D.DiagComponentLogger = DiagComponentLogger;
function logProxy(funcName, namespace, args) {
  const logger = (0, global_utils_1$5.getGlobal)("diag");
  if (!logger) {
    return;
  }
  return logger[funcName](namespace, ...args);
}
var _DiagComponentLogger = exports$D.DiagComponentLogger;
var _default$B;
if (typeof exports$D === "object" && exports$D !== null && "default" in exports$D) {
  _default$B = exports$D.default;
} else {
  _default$B = exports$D;
}
const _default_default$B = _default$B;
var __require$B = exports$D;
exports$D.__esModule;
const _mod$b = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  DiagComponentLogger: _DiagComponentLogger,
  __require: __require$B,
  default: _default_default$B
}, Symbol.toStringTag, { value: "Module" }));
var exports$C = {};
Object.defineProperty(exports$C, "__esModule", {
  value: true
});
Object.defineProperty(exports$C, "__esModule", {
  value: true
});
exports$C.DiagAPI = void 0;
const ComponentLogger_1 = __require$B ?? _default_default$B ?? _mod$b;
const logLevelLogger_1 = __require$C ?? _default_default$C ?? _mod2$4;
const types_1$1 = __require$D ?? _default_default$D ?? _mod4$2;
const global_utils_1$4 = __require$E ?? _default_default$E ?? _mod2$5;
const API_NAME$4 = "diag";
class DiagAPI {
  /** Get the singleton instance of the DiagAPI API */
  static instance() {
    if (!this._instance) {
      this._instance = new DiagAPI();
    }
    return this._instance;
  }
  /**
   * Private internal constructor
   * @private
   */
  constructor() {
    function _logProxy(funcName) {
      return function(...args) {
        const logger = (0, global_utils_1$4.getGlobal)("diag");
        if (!logger) return;
        return logger[funcName](...args);
      };
    }
    const self2 = this;
    const setLogger = (logger, optionsOrLogLevel = {
      logLevel: types_1$1.DiagLogLevel.INFO
    }) => {
      var _a2, _b, _c;
      if (logger === self2) {
        const err = new Error("Cannot use diag as the logger for itself. Please use a DiagLogger implementation like ConsoleDiagLogger or a custom implementation");
        self2.error((_a2 = err.stack) !== null && _a2 !== void 0 ? _a2 : err.message);
        return false;
      }
      if (typeof optionsOrLogLevel === "number") {
        optionsOrLogLevel = {
          logLevel: optionsOrLogLevel
        };
      }
      const oldLogger = (0, global_utils_1$4.getGlobal)("diag");
      const newLogger = (0, logLevelLogger_1.createLogLevelDiagLogger)((_b = optionsOrLogLevel.logLevel) !== null && _b !== void 0 ? _b : types_1$1.DiagLogLevel.INFO, logger);
      if (oldLogger && !optionsOrLogLevel.suppressOverrideMessage) {
        const stack = (_c = new Error().stack) !== null && _c !== void 0 ? _c : "<failed to generate stacktrace>";
        oldLogger.warn(`Current logger will be overwritten from ${stack}`);
        newLogger.warn(`Current logger will overwrite one already registered from ${stack}`);
      }
      return (0, global_utils_1$4.registerGlobal)("diag", newLogger, self2, true);
    };
    self2.setLogger = setLogger;
    self2.disable = () => {
      (0, global_utils_1$4.unregisterGlobal)(API_NAME$4, self2);
    };
    self2.createComponentLogger = (options2) => {
      return new ComponentLogger_1.DiagComponentLogger(options2);
    };
    self2.verbose = _logProxy("verbose");
    self2.debug = _logProxy("debug");
    self2.info = _logProxy("info");
    self2.warn = _logProxy("warn");
    self2.error = _logProxy("error");
  }
}
exports$C.DiagAPI = DiagAPI;
var _DiagAPI = exports$C.DiagAPI;
var _default$A;
if (typeof exports$C === "object" && exports$C !== null && "default" in exports$C) {
  _default$A = exports$C.default;
} else {
  _default$A = exports$C;
}
const _default_default$A = _default$A;
var __require$A = exports$C;
exports$C.__esModule;
const _mod$a = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  DiagAPI: _DiagAPI,
  __require: __require$A,
  default: _default_default$A
}, Symbol.toStringTag, { value: "Module" }));
var exports$B = {};
Object.defineProperty(exports$B, "__esModule", {
  value: true
});
Object.defineProperty(exports$B, "__esModule", {
  value: true
});
function createContextKey(description) {
  return Symbol.for(description);
}
exports$B.createContextKey = createContextKey;
class BaseContext {
  /**
   * Construct a new context which inherits values from an optional parent context.
   *
   * @param parentContext a context from which to inherit values
   */
  constructor(parentContext) {
    const self2 = this;
    self2._currentContext = parentContext ? new Map(parentContext) : /* @__PURE__ */ new Map();
    self2.getValue = (key) => self2._currentContext.get(key);
    self2.setValue = (key, value) => {
      const context = new BaseContext(self2._currentContext);
      context._currentContext.set(key, value);
      return context;
    };
    self2.deleteValue = (key) => {
      const context = new BaseContext(self2._currentContext);
      context._currentContext.delete(key);
      return context;
    };
  }
}
exports$B.ROOT_CONTEXT = new BaseContext();
var _createContextKey = exports$B.createContextKey;
var _ROOT_CONTEXT = exports$B.ROOT_CONTEXT;
var _default$z;
if (typeof exports$B === "object" && exports$B !== null && "default" in exports$B) {
  _default$z = exports$B.default;
} else {
  _default$z = exports$B;
}
const _default_default$z = _default$z;
var __require$z = exports$B;
exports$B.__esModule;
const _mod2$3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ROOT_CONTEXT: _ROOT_CONTEXT,
  __require: __require$z,
  createContextKey: _createContextKey,
  default: _default_default$z
}, Symbol.toStringTag, { value: "Module" }));
var exports$A = {};
Object.defineProperty(exports$A, "__esModule", {
  value: true
});
Object.defineProperty(exports$A, "__esModule", {
  value: true
});
exports$A.NoopContextManager = void 0;
const context_1$5 = __require$z ?? _default_default$z ?? _mod2$3;
class NoopContextManager {
  active() {
    return context_1$5.ROOT_CONTEXT;
  }
  with(_context2, fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  bind(_context2, target) {
    return target;
  }
  enable() {
    return this;
  }
  disable() {
    return this;
  }
}
exports$A.NoopContextManager = NoopContextManager;
var _NoopContextManager = exports$A.NoopContextManager;
var _default$y;
if (typeof exports$A === "object" && exports$A !== null && "default" in exports$A) {
  _default$y = exports$A.default;
} else {
  _default$y = exports$A;
}
const _default_default$y = _default$y;
var __require$y = exports$A;
exports$A.__esModule;
const _mod$9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  NoopContextManager: _NoopContextManager,
  __require: __require$y,
  default: _default_default$y
}, Symbol.toStringTag, { value: "Module" }));
var exports$z = {};
Object.defineProperty(exports$z, "__esModule", {
  value: true
});
Object.defineProperty(exports$z, "__esModule", {
  value: true
});
exports$z.ContextAPI = void 0;
const NoopContextManager_1 = __require$y ?? _default_default$y ?? _mod$9;
const global_utils_1$3 = __require$E ?? _default_default$E ?? _mod2$5;
const diag_1$5 = __require$A ?? _default_default$A ?? _mod$a;
const API_NAME$3 = "context";
const NOOP_CONTEXT_MANAGER = new NoopContextManager_1.NoopContextManager();
class ContextAPI {
  /** Empty private constructor prevents end users from constructing a new instance of the API */
  constructor() {
  }
  /** Get the singleton instance of the Context API */
  static getInstance() {
    if (!this._instance) {
      this._instance = new ContextAPI();
    }
    return this._instance;
  }
  /**
   * Set the current context manager.
   *
   * @returns true if the context manager was successfully registered, else false
   */
  setGlobalContextManager(contextManager) {
    return (0, global_utils_1$3.registerGlobal)(API_NAME$3, contextManager, diag_1$5.DiagAPI.instance());
  }
  /**
   * Get the currently active context
   */
  active() {
    return this._getContextManager().active();
  }
  /**
   * Execute a function with an active context
   *
   * @param context context to be active during function execution
   * @param fn function to execute in a context
   * @param thisArg optional receiver to be used for calling fn
   * @param args optional arguments forwarded to fn
   */
  with(context, fn, thisArg, ...args) {
    return this._getContextManager().with(context, fn, thisArg, ...args);
  }
  /**
   * Bind a context to a target function or event emitter
   *
   * @param context context to bind to the event emitter or function. Defaults to the currently active context
   * @param target function or event emitter to bind
   */
  bind(context, target) {
    return this._getContextManager().bind(context, target);
  }
  _getContextManager() {
    return (0, global_utils_1$3.getGlobal)(API_NAME$3) || NOOP_CONTEXT_MANAGER;
  }
  /** Disable and remove the global context manager */
  disable() {
    this._getContextManager().disable();
    (0, global_utils_1$3.unregisterGlobal)(API_NAME$3, diag_1$5.DiagAPI.instance());
  }
}
exports$z.ContextAPI = ContextAPI;
var _ContextAPI = exports$z.ContextAPI;
var _default$x;
if (typeof exports$z === "object" && exports$z !== null && "default" in exports$z) {
  _default$x = exports$z.default;
} else {
  _default$x = exports$z;
}
const _default_default$x = _default$x;
var __require$x = exports$z;
exports$z.__esModule;
const _mod$8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ContextAPI: _ContextAPI,
  __require: __require$x,
  default: _default_default$x
}, Symbol.toStringTag, { value: "Module" }));
var exports$y = {};
Object.defineProperty(exports$y, "__esModule", {
  value: true
});
Object.defineProperty(exports$y, "__esModule", {
  value: true
});
exports$y.TraceFlags = void 0;
(function(TraceFlags) {
  TraceFlags[TraceFlags["NONE"] = 0] = "NONE";
  TraceFlags[TraceFlags["SAMPLED"] = 1] = "SAMPLED";
})(exports$y.TraceFlags || (exports$y.TraceFlags = {}));
var _TraceFlags = exports$y.TraceFlags;
var _default$w;
if (typeof exports$y === "object" && exports$y !== null && "default" in exports$y) {
  _default$w = exports$y.default;
} else {
  _default$w = exports$y;
}
const _default_default$w = _default$w;
var __require$w = exports$y;
exports$y.__esModule;
const _mod11 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  TraceFlags: _TraceFlags,
  __require: __require$w,
  default: _default_default$w
}, Symbol.toStringTag, { value: "Module" }));
var exports$x = {};
Object.defineProperty(exports$x, "__esModule", {
  value: true
});
Object.defineProperty(exports$x, "__esModule", {
  value: true
});
const trace_flags_1$1 = __require$w ?? _default_default$w ?? _mod11;
exports$x.INVALID_SPANID = "0000000000000000";
exports$x.INVALID_TRACEID = "00000000000000000000000000000000";
exports$x.INVALID_SPAN_CONTEXT = {
  traceId: exports$x.INVALID_TRACEID,
  spanId: exports$x.INVALID_SPANID,
  traceFlags: trace_flags_1$1.TraceFlags.NONE
};
var _INVALID_SPANID = exports$x.INVALID_SPANID;
var _INVALID_TRACEID = exports$x.INVALID_TRACEID;
var _INVALID_SPAN_CONTEXT = exports$x.INVALID_SPAN_CONTEXT;
var _default$v;
if (typeof exports$x === "object" && exports$x !== null && "default" in exports$x) {
  _default$v = exports$x.default;
} else {
  _default$v = exports$x;
}
const _default_default$v = _default$v;
var __require$v = exports$x;
exports$x.__esModule;
const _mod14 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  INVALID_SPANID: _INVALID_SPANID,
  INVALID_SPAN_CONTEXT: _INVALID_SPAN_CONTEXT,
  INVALID_TRACEID: _INVALID_TRACEID,
  __require: __require$v,
  default: _default_default$v
}, Symbol.toStringTag, { value: "Module" }));
var exports$w = {};
Object.defineProperty(exports$w, "__esModule", {
  value: true
});
Object.defineProperty(exports$w, "__esModule", {
  value: true
});
exports$w.NonRecordingSpan = void 0;
const invalid_span_constants_1$2 = __require$v ?? _default_default$v ?? _mod14;
class NonRecordingSpan {
  constructor(spanContext = invalid_span_constants_1$2.INVALID_SPAN_CONTEXT) {
    this._spanContext = spanContext;
  }
  // Returns a SpanContext.
  spanContext() {
    return this._spanContext;
  }
  // By default does nothing
  setAttribute(_key, _value) {
    return this;
  }
  // By default does nothing
  setAttributes(_attributes) {
    return this;
  }
  // By default does nothing
  addEvent(_name, _attributes) {
    return this;
  }
  addLink(_link) {
    return this;
  }
  addLinks(_links) {
    return this;
  }
  // By default does nothing
  setStatus(_status) {
    return this;
  }
  // By default does nothing
  updateName(_name) {
    return this;
  }
  // By default does nothing
  end(_endTime) {
  }
  // isRecording always returns false for NonRecordingSpan.
  isRecording() {
    return false;
  }
  // By default does nothing
  recordException(_exception, _time) {
  }
}
exports$w.NonRecordingSpan = NonRecordingSpan;
var _NonRecordingSpan = exports$w.NonRecordingSpan;
var _default$u;
if (typeof exports$w === "object" && exports$w !== null && "default" in exports$w) {
  _default$u = exports$w.default;
} else {
  _default$u = exports$w;
}
const _default_default$u = _default$u;
var __require$u = exports$w;
exports$w.__esModule;
const _mod3$2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  NonRecordingSpan: _NonRecordingSpan,
  __require: __require$u,
  default: _default_default$u
}, Symbol.toStringTag, { value: "Module" }));
var exports$v = {};
Object.defineProperty(exports$v, "__esModule", {
  value: true
});
Object.defineProperty(exports$v, "__esModule", {
  value: true
});
const context_1$4 = __require$z ?? _default_default$z ?? _mod2$3;
const NonRecordingSpan_1$2 = __require$u ?? _default_default$u ?? _mod3$2;
const context_2$1 = __require$x ?? _default_default$x ?? _mod$8;
const SPAN_KEY = (0, context_1$4.createContextKey)("OpenTelemetry Context Key SPAN");
function getSpan(context) {
  return context.getValue(SPAN_KEY) || void 0;
}
exports$v.getSpan = getSpan;
function getActiveSpan() {
  return getSpan(context_2$1.ContextAPI.getInstance().active());
}
exports$v.getActiveSpan = getActiveSpan;
function setSpan(context, span) {
  return context.setValue(SPAN_KEY, span);
}
exports$v.setSpan = setSpan;
function deleteSpan(context) {
  return context.deleteValue(SPAN_KEY);
}
exports$v.deleteSpan = deleteSpan;
function setSpanContext(context, spanContext) {
  return setSpan(context, new NonRecordingSpan_1$2.NonRecordingSpan(spanContext));
}
exports$v.setSpanContext = setSpanContext;
function getSpanContext(context) {
  var _a2;
  return (_a2 = getSpan(context)) === null || _a2 === void 0 ? void 0 : _a2.spanContext();
}
exports$v.getSpanContext = getSpanContext;
var _getSpan = exports$v.getSpan;
var _getActiveSpan = exports$v.getActiveSpan;
var _setSpan = exports$v.setSpan;
var _deleteSpan = exports$v.deleteSpan;
var _setSpanContext = exports$v.setSpanContext;
var _getSpanContext = exports$v.getSpanContext;
var _default$t;
if (typeof exports$v === "object" && exports$v !== null && "default" in exports$v) {
  _default$t = exports$v.default;
} else {
  _default$t = exports$v;
}
const _default_default$t = _default$t;
var __require$t = exports$v;
exports$v.__esModule;
const _mod4$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __require: __require$t,
  default: _default_default$t,
  deleteSpan: _deleteSpan,
  getActiveSpan: _getActiveSpan,
  getSpan: _getSpan,
  getSpanContext: _getSpanContext,
  setSpan: _setSpan,
  setSpanContext: _setSpanContext
}, Symbol.toStringTag, { value: "Module" }));
var exports$u = {};
Object.defineProperty(exports$u, "__esModule", {
  value: true
});
Object.defineProperty(exports$u, "__esModule", {
  value: true
});
const invalid_span_constants_1$1 = __require$v ?? _default_default$v ?? _mod14;
const NonRecordingSpan_1$1 = __require$u ?? _default_default$u ?? _mod3$2;
const isHex = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1]);
function isValidHex(id, length) {
  if (typeof id !== "string" || id.length !== length) return false;
  let r2 = 0;
  for (let i2 = 0; i2 < id.length; i2 += 4) {
    r2 += (isHex[id.charCodeAt(i2)] | 0) + (isHex[id.charCodeAt(i2 + 1)] | 0) + (isHex[id.charCodeAt(i2 + 2)] | 0) + (isHex[id.charCodeAt(i2 + 3)] | 0);
  }
  return r2 === length;
}
function isValidTraceId(traceId) {
  return isValidHex(traceId, 32) && traceId !== invalid_span_constants_1$1.INVALID_TRACEID;
}
exports$u.isValidTraceId = isValidTraceId;
function isValidSpanId(spanId) {
  return isValidHex(spanId, 16) && spanId !== invalid_span_constants_1$1.INVALID_SPANID;
}
exports$u.isValidSpanId = isValidSpanId;
function isSpanContextValid(spanContext) {
  return isValidTraceId(spanContext.traceId) && isValidSpanId(spanContext.spanId);
}
exports$u.isSpanContextValid = isSpanContextValid;
function wrapSpanContext(spanContext) {
  return new NonRecordingSpan_1$1.NonRecordingSpan(spanContext);
}
exports$u.wrapSpanContext = wrapSpanContext;
var _isValidTraceId = exports$u.isValidTraceId;
var _isValidSpanId = exports$u.isValidSpanId;
var _isSpanContextValid$1 = exports$u.isSpanContextValid;
var _wrapSpanContext = exports$u.wrapSpanContext;
var _default$s;
if (typeof exports$u === "object" && exports$u !== null && "default" in exports$u) {
  _default$s = exports$u.default;
} else {
  _default$s = exports$u;
}
const _default_default$s = _default$s;
var __require$s = exports$u;
exports$u.__esModule;
const _mod13 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __require: __require$s,
  default: _default_default$s,
  isSpanContextValid: _isSpanContextValid$1,
  isValidSpanId: _isValidSpanId,
  isValidTraceId: _isValidTraceId,
  wrapSpanContext: _wrapSpanContext
}, Symbol.toStringTag, { value: "Module" }));
var exports$t = {};
Object.defineProperty(exports$t, "__esModule", {
  value: true
});
Object.defineProperty(exports$t, "__esModule", {
  value: true
});
exports$t.NoopTracer = void 0;
const context_1$3 = __require$x ?? _default_default$x ?? _mod$8;
const context_utils_1$1 = __require$t ?? _default_default$t ?? _mod4$1;
const NonRecordingSpan_1 = __require$u ?? _default_default$u ?? _mod3$2;
const spancontext_utils_1$2 = __require$s ?? _default_default$s ?? _mod13;
const contextApi = context_1$3.ContextAPI.getInstance();
class NoopTracer {
  // startSpan starts a noop span.
  startSpan(name, options2, context = contextApi.active()) {
    const root2 = Boolean(options2 === null || options2 === void 0 ? void 0 : options2.root);
    if (root2) {
      return new NonRecordingSpan_1.NonRecordingSpan();
    }
    const parentFromContext = context && (0, context_utils_1$1.getSpanContext)(context);
    if (isSpanContext(parentFromContext) && (0, spancontext_utils_1$2.isSpanContextValid)(parentFromContext)) {
      return new NonRecordingSpan_1.NonRecordingSpan(parentFromContext);
    } else {
      return new NonRecordingSpan_1.NonRecordingSpan();
    }
  }
  startActiveSpan(name, arg2, arg3, arg4) {
    let opts;
    let ctx;
    let fn;
    if (arguments.length < 2) {
      return;
    } else if (arguments.length === 2) {
      fn = arg2;
    } else if (arguments.length === 3) {
      opts = arg2;
      fn = arg3;
    } else {
      opts = arg2;
      ctx = arg3;
      fn = arg4;
    }
    const parentContext = ctx !== null && ctx !== void 0 ? ctx : contextApi.active();
    const span = this.startSpan(name, opts, parentContext);
    const contextWithSpanSet = (0, context_utils_1$1.setSpan)(parentContext, span);
    return contextApi.with(contextWithSpanSet, fn, void 0, span);
  }
}
exports$t.NoopTracer = NoopTracer;
function isSpanContext(spanContext) {
  return spanContext !== null && typeof spanContext === "object" && "spanId" in spanContext && typeof spanContext["spanId"] === "string" && "traceId" in spanContext && typeof spanContext["traceId"] === "string" && "traceFlags" in spanContext && typeof spanContext["traceFlags"] === "number";
}
var _NoopTracer = exports$t.NoopTracer;
var _default$r;
if (typeof exports$t === "object" && exports$t !== null && "default" in exports$t) {
  _default$r = exports$t.default;
} else {
  _default$r = exports$t;
}
const _default_default$r = _default$r;
var __require$r = exports$t;
exports$t.__esModule;
const _mod$7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  NoopTracer: _NoopTracer,
  __require: __require$r,
  default: _default_default$r
}, Symbol.toStringTag, { value: "Module" }));
var exports$s = {};
Object.defineProperty(exports$s, "__esModule", {
  value: true
});
Object.defineProperty(exports$s, "__esModule", {
  value: true
});
exports$s.NoopTracerProvider = void 0;
const NoopTracer_1$1 = __require$r ?? _default_default$r ?? _mod$7;
class NoopTracerProvider {
  getTracer(_name, _version, _options) {
    return new NoopTracer_1$1.NoopTracer();
  }
}
exports$s.NoopTracerProvider = NoopTracerProvider;
var _NoopTracerProvider = exports$s.NoopTracerProvider;
var _default$q;
if (typeof exports$s === "object" && exports$s !== null && "default" in exports$s) {
  _default$q = exports$s.default;
} else {
  _default$q = exports$s;
}
const _default_default$q = _default$q;
var __require$q = exports$s;
exports$s.__esModule;
const _mod2$2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  NoopTracerProvider: _NoopTracerProvider,
  __require: __require$q,
  default: _default_default$q
}, Symbol.toStringTag, { value: "Module" }));
var exports$r = {};
Object.defineProperty(exports$r, "__esModule", {
  value: true
});
Object.defineProperty(exports$r, "__esModule", {
  value: true
});
exports$r.ProxyTracer = void 0;
const NoopTracer_1 = __require$r ?? _default_default$r ?? _mod$7;
const NOOP_TRACER = new NoopTracer_1.NoopTracer();
class ProxyTracer {
  constructor(provider, name, version2, options2) {
    this._provider = provider;
    this.name = name;
    this.version = version2;
    this.options = options2;
  }
  startSpan(name, options2, context) {
    return this._getTracer().startSpan(name, options2, context);
  }
  startActiveSpan(_name, _options, _context2, _fn) {
    const tracer2 = this._getTracer();
    return Reflect.apply(tracer2.startActiveSpan, tracer2, arguments);
  }
  /**
   * Try to get a tracer from the proxy tracer provider.
   * If the proxy tracer provider has no delegate, return a noop tracer.
   */
  _getTracer() {
    if (this._delegate) {
      return this._delegate;
    }
    const tracer2 = this._provider.getDelegateTracer(this.name, this.version, this.options);
    if (!tracer2) {
      return NOOP_TRACER;
    }
    this._delegate = tracer2;
    return this._delegate;
  }
}
exports$r.ProxyTracer = ProxyTracer;
var _ProxyTracer = exports$r.ProxyTracer;
var _default$p;
if (typeof exports$r === "object" && exports$r !== null && "default" in exports$r) {
  _default$p = exports$r.default;
} else {
  _default$p = exports$r;
}
const _default_default$p = _default$p;
var __require$p = exports$r;
exports$r.__esModule;
const _mod8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ProxyTracer: _ProxyTracer,
  __require: __require$p,
  default: _default_default$p
}, Symbol.toStringTag, { value: "Module" }));
var exports$q = {};
Object.defineProperty(exports$q, "__esModule", {
  value: true
});
Object.defineProperty(exports$q, "__esModule", {
  value: true
});
exports$q.ProxyTracerProvider = void 0;
const ProxyTracer_1$1 = __require$p ?? _default_default$p ?? _mod8;
const NoopTracerProvider_1 = __require$q ?? _default_default$q ?? _mod2$2;
const NOOP_TRACER_PROVIDER = new NoopTracerProvider_1.NoopTracerProvider();
class ProxyTracerProvider {
  /**
   * Get a {@link ProxyTracer}
   */
  getTracer(name, version2, options2) {
    var _a2;
    return (_a2 = this.getDelegateTracer(name, version2, options2)) !== null && _a2 !== void 0 ? _a2 : new ProxyTracer_1$1.ProxyTracer(this, name, version2, options2);
  }
  getDelegate() {
    var _a2;
    return (_a2 = this._delegate) !== null && _a2 !== void 0 ? _a2 : NOOP_TRACER_PROVIDER;
  }
  /**
   * Set the delegate tracer provider
   */
  setDelegate(delegate) {
    this._delegate = delegate;
  }
  getDelegateTracer(name, version2, options2) {
    var _a2;
    return (_a2 = this._delegate) === null || _a2 === void 0 ? void 0 : _a2.getTracer(name, version2, options2);
  }
}
exports$q.ProxyTracerProvider = ProxyTracerProvider;
var _ProxyTracerProvider = exports$q.ProxyTracerProvider;
var _default$o;
if (typeof exports$q === "object" && exports$q !== null && "default" in exports$q) {
  _default$o = exports$q.default;
} else {
  _default$o = exports$q;
}
const _default_default$o = _default$o;
var __require$o = exports$q;
exports$q.__esModule;
const _mod9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ProxyTracerProvider: _ProxyTracerProvider,
  __require: __require$o,
  default: _default_default$o
}, Symbol.toStringTag, { value: "Module" }));
var exports$p = {};
Object.defineProperty(exports$p, "__esModule", {
  value: true
});
Object.defineProperty(exports$p, "__esModule", {
  value: true
});
exports$p.TraceAPI = void 0;
const global_utils_1$2 = __require$E ?? _default_default$E ?? _mod2$5;
const ProxyTracerProvider_1$1 = __require$o ?? _default_default$o ?? _mod9;
const spancontext_utils_1$1 = __require$s ?? _default_default$s ?? _mod13;
const context_utils_1 = __require$t ?? _default_default$t ?? _mod4$1;
const diag_1$4 = __require$A ?? _default_default$A ?? _mod$a;
const API_NAME$2 = "trace";
class TraceAPI {
  /** Empty private constructor prevents end users from constructing a new instance of the API */
  constructor() {
    this._proxyTracerProvider = new ProxyTracerProvider_1$1.ProxyTracerProvider();
    this.wrapSpanContext = spancontext_utils_1$1.wrapSpanContext;
    this.isSpanContextValid = spancontext_utils_1$1.isSpanContextValid;
    this.deleteSpan = context_utils_1.deleteSpan;
    this.getSpan = context_utils_1.getSpan;
    this.getActiveSpan = context_utils_1.getActiveSpan;
    this.getSpanContext = context_utils_1.getSpanContext;
    this.setSpan = context_utils_1.setSpan;
    this.setSpanContext = context_utils_1.setSpanContext;
  }
  /** Get the singleton instance of the Trace API */
  static getInstance() {
    if (!this._instance) {
      this._instance = new TraceAPI();
    }
    return this._instance;
  }
  /**
   * Set the current global tracer.
   *
   * @returns true if the tracer provider was successfully registered, else false
   */
  setGlobalTracerProvider(provider) {
    const success = (0, global_utils_1$2.registerGlobal)(API_NAME$2, this._proxyTracerProvider, diag_1$4.DiagAPI.instance());
    if (success) {
      this._proxyTracerProvider.setDelegate(provider);
    }
    return success;
  }
  /**
   * Returns the global tracer provider.
   */
  getTracerProvider() {
    return (0, global_utils_1$2.getGlobal)(API_NAME$2) || this._proxyTracerProvider;
  }
  /**
   * Returns a tracer from the global tracer provider.
   */
  getTracer(name, version2) {
    return this.getTracerProvider().getTracer(name, version2);
  }
  /** Remove the global tracer provider */
  disable() {
    (0, global_utils_1$2.unregisterGlobal)(API_NAME$2, diag_1$4.DiagAPI.instance());
    this._proxyTracerProvider = new ProxyTracerProvider_1$1.ProxyTracerProvider();
  }
}
exports$p.TraceAPI = TraceAPI;
var _TraceAPI = exports$p.TraceAPI;
var _default$n;
if (typeof exports$p === "object" && exports$p !== null && "default" in exports$p) {
  _default$n = exports$p.default;
} else {
  _default$n = exports$p;
}
const _default_default$n = _default$n;
var __require$n = exports$p;
exports$p.__esModule;
const _mod$6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  TraceAPI: _TraceAPI,
  __require: __require$n,
  default: _default_default$n
}, Symbol.toStringTag, { value: "Module" }));
var exports$o = {};
Object.defineProperty(exports$o, "__esModule", {
  value: true
});
Object.defineProperty(exports$o, "__esModule", {
  value: true
});
exports$o.trace = void 0;
const trace_1 = __require$n ?? _default_default$n ?? _mod$6;
exports$o.trace = trace_1.TraceAPI.getInstance();
var _trace$1 = exports$o.trace;
var _default$m;
if (typeof exports$o === "object" && exports$o !== null && "default" in exports$o) {
  _default$m = exports$o.default;
} else {
  _default$m = exports$o;
}
const _default_default$m = _default$m;
var __require$m = exports$o;
exports$o.__esModule;
const _mod19 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __require: __require$m,
  default: _default_default$m,
  trace: _trace$1
}, Symbol.toStringTag, { value: "Module" }));
var exports$n = {};
Object.defineProperty(exports$n, "__esModule", {
  value: true
});
Object.defineProperty(exports$n, "__esModule", {
  value: true
});
exports$n.baggageEntryMetadataSymbol = void 0;
exports$n.baggageEntryMetadataSymbol = /* @__PURE__ */ Symbol("BaggageEntryMetadata");
var _baggageEntryMetadataSymbol = exports$n.baggageEntryMetadataSymbol;
var _default$l;
if (typeof exports$n === "object" && exports$n !== null && "default" in exports$n) {
  _default$l = exports$n.default;
} else {
  _default$l = exports$n;
}
const _default_default$l = _default$l;
var __require$l = exports$n;
exports$n.__esModule;
const _mod3$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __require: __require$l,
  baggageEntryMetadataSymbol: _baggageEntryMetadataSymbol,
  default: _default_default$l
}, Symbol.toStringTag, { value: "Module" }));
var exports$m = {};
Object.defineProperty(exports$m, "__esModule", {
  value: true
});
Object.defineProperty(exports$m, "__esModule", {
  value: true
});
exports$m.BaggageImpl = void 0;
class BaggageImpl {
  constructor(entries) {
    this._entries = entries ? new Map(entries) : /* @__PURE__ */ new Map();
  }
  getEntry(key) {
    const entry = this._entries.get(key);
    if (!entry) {
      return void 0;
    }
    return Object.assign({}, entry);
  }
  getAllEntries() {
    return Array.from(this._entries.entries());
  }
  setEntry(key, entry) {
    const newBaggage = new BaggageImpl(this._entries);
    newBaggage._entries.set(key, entry);
    return newBaggage;
  }
  removeEntry(key) {
    const newBaggage = new BaggageImpl(this._entries);
    newBaggage._entries.delete(key);
    return newBaggage;
  }
  removeEntries(...keys) {
    const newBaggage = new BaggageImpl(this._entries);
    for (const key of keys) {
      newBaggage._entries.delete(key);
    }
    return newBaggage;
  }
  clear() {
    return new BaggageImpl();
  }
}
exports$m.BaggageImpl = BaggageImpl;
var _BaggageImpl = exports$m.BaggageImpl;
var _default$k;
if (typeof exports$m === "object" && exports$m !== null && "default" in exports$m) {
  _default$k = exports$m.default;
} else {
  _default$k = exports$m;
}
const _default_default$k = _default$k;
var __require$k = exports$m;
exports$m.__esModule;
const _mod2$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  BaggageImpl: _BaggageImpl,
  __require: __require$k,
  default: _default_default$k
}, Symbol.toStringTag, { value: "Module" }));
var exports$l = {};
Object.defineProperty(exports$l, "__esModule", {
  value: true
});
Object.defineProperty(exports$l, "__esModule", {
  value: true
});
const diag_1$3 = __require$A ?? _default_default$A ?? _mod$a;
const baggage_impl_1 = __require$k ?? _default_default$k ?? _mod2$1;
const symbol_1 = __require$l ?? _default_default$l ?? _mod3$1;
const diag = diag_1$3.DiagAPI.instance();
function createBaggage(entries = {}) {
  return new baggage_impl_1.BaggageImpl(new Map(Object.entries(entries)));
}
exports$l.createBaggage = createBaggage;
function baggageEntryMetadataFromString(str) {
  if (typeof str !== "string") {
    diag.error(`Cannot create baggage metadata from unknown type: ${typeof str}`);
    str = "";
  }
  return {
    __TYPE__: symbol_1.baggageEntryMetadataSymbol,
    toString() {
      return str;
    }
  };
}
exports$l.baggageEntryMetadataFromString = baggageEntryMetadataFromString;
var _createBaggage = exports$l.createBaggage;
var _baggageEntryMetadataFromString = exports$l.baggageEntryMetadataFromString;
var _default$j;
if (typeof exports$l === "object" && exports$l !== null && "default" in exports$l) {
  _default$j = exports$l.default;
} else {
  _default$j = exports$l;
}
const _default_default$j = _default$j;
var __require$j = exports$l;
exports$l.__esModule;
const _mod$5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __require: __require$j,
  baggageEntryMetadataFromString: _baggageEntryMetadataFromString,
  createBaggage: _createBaggage,
  default: _default_default$j
}, Symbol.toStringTag, { value: "Module" }));
var exports$k = {};
Object.defineProperty(exports$k, "__esModule", {
  value: true
});
Object.defineProperty(exports$k, "__esModule", {
  value: true
});
const context_1$2 = __require$x ?? _default_default$x ?? _mod$8;
const context_2 = __require$z ?? _default_default$z ?? _mod2$3;
const BAGGAGE_KEY = (0, context_2.createContextKey)("OpenTelemetry Baggage Key");
function getBaggage(context) {
  return context.getValue(BAGGAGE_KEY) || void 0;
}
exports$k.getBaggage = getBaggage;
function getActiveBaggage() {
  return getBaggage(context_1$2.ContextAPI.getInstance().active());
}
exports$k.getActiveBaggage = getActiveBaggage;
function setBaggage(context, baggage) {
  return context.setValue(BAGGAGE_KEY, baggage);
}
exports$k.setBaggage = setBaggage;
function deleteBaggage(context) {
  return context.deleteValue(BAGGAGE_KEY);
}
exports$k.deleteBaggage = deleteBaggage;
var _getBaggage = exports$k.getBaggage;
var _getActiveBaggage = exports$k.getActiveBaggage;
var _setBaggage = exports$k.setBaggage;
var _deleteBaggage = exports$k.deleteBaggage;
var _default$i;
if (typeof exports$k === "object" && exports$k !== null && "default" in exports$k) {
  _default$i = exports$k.default;
} else {
  _default$i = exports$k;
}
const _default_default$i = _default$i;
var __require$i = exports$k;
exports$k.__esModule;
const _mod4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __require: __require$i,
  default: _default_default$i,
  deleteBaggage: _deleteBaggage,
  getActiveBaggage: _getActiveBaggage,
  getBaggage: _getBaggage,
  setBaggage: _setBaggage
}, Symbol.toStringTag, { value: "Module" }));
var exports$j = {};
Object.defineProperty(exports$j, "__esModule", {
  value: true
});
Object.defineProperty(exports$j, "__esModule", {
  value: true
});
exports$j.defaultTextMapGetter = {
  get(carrier, key) {
    if (carrier == null) {
      return void 0;
    }
    return carrier[key];
  },
  keys(carrier) {
    if (carrier == null) {
      return [];
    }
    return Object.keys(carrier);
  }
};
exports$j.defaultTextMapSetter = {
  set(carrier, key, value) {
    if (carrier == null) {
      return;
    }
    carrier[key] = value;
  }
};
var _defaultTextMapGetter = exports$j.defaultTextMapGetter;
var _defaultTextMapSetter = exports$j.defaultTextMapSetter;
var _default$h;
if (typeof exports$j === "object" && exports$j !== null && "default" in exports$j) {
  _default$h = exports$j.default;
} else {
  _default$h = exports$j;
}
const _default_default$h = _default$h;
var __require$h = exports$j;
exports$j.__esModule;
const _mod7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __require: __require$h,
  default: _default_default$h,
  defaultTextMapGetter: _defaultTextMapGetter,
  defaultTextMapSetter: _defaultTextMapSetter
}, Symbol.toStringTag, { value: "Module" }));
var exports$i = {};
Object.defineProperty(exports$i, "__esModule", {
  value: true
});
Object.defineProperty(exports$i, "__esModule", {
  value: true
});
exports$i.NoopTextMapPropagator = void 0;
class NoopTextMapPropagator {
  /** Noop inject function does nothing */
  inject(_context2, _carrier) {
  }
  /** Noop extract function does nothing and returns the input context */
  extract(context, _carrier) {
    return context;
  }
  fields() {
    return [];
  }
}
exports$i.NoopTextMapPropagator = NoopTextMapPropagator;
var _NoopTextMapPropagator = exports$i.NoopTextMapPropagator;
var _default$g;
if (typeof exports$i === "object" && exports$i !== null && "default" in exports$i) {
  _default$g = exports$i.default;
} else {
  _default$g = exports$i;
}
const _default_default$g = _default$g;
var __require$g = exports$i;
exports$i.__esModule;
const _mod2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  NoopTextMapPropagator: _NoopTextMapPropagator,
  __require: __require$g,
  default: _default_default$g
}, Symbol.toStringTag, { value: "Module" }));
var exports$h = {};
Object.defineProperty(exports$h, "__esModule", {
  value: true
});
Object.defineProperty(exports$h, "__esModule", {
  value: true
});
exports$h.PropagationAPI = void 0;
const global_utils_1$1 = __require$E ?? _default_default$E ?? _mod2$5;
const NoopTextMapPropagator_1 = __require$g ?? _default_default$g ?? _mod2;
const TextMapPropagator_1$1 = __require$h ?? _default_default$h ?? _mod7;
const context_helpers_1 = __require$i ?? _default_default$i ?? _mod4;
const utils_1$1 = __require$j ?? _default_default$j ?? _mod$5;
const diag_1$2 = __require$A ?? _default_default$A ?? _mod$a;
const API_NAME$1 = "propagation";
const NOOP_TEXT_MAP_PROPAGATOR = new NoopTextMapPropagator_1.NoopTextMapPropagator();
class PropagationAPI {
  /** Empty private constructor prevents end users from constructing a new instance of the API */
  constructor() {
    this.createBaggage = utils_1$1.createBaggage;
    this.getBaggage = context_helpers_1.getBaggage;
    this.getActiveBaggage = context_helpers_1.getActiveBaggage;
    this.setBaggage = context_helpers_1.setBaggage;
    this.deleteBaggage = context_helpers_1.deleteBaggage;
  }
  /** Get the singleton instance of the Propagator API */
  static getInstance() {
    if (!this._instance) {
      this._instance = new PropagationAPI();
    }
    return this._instance;
  }
  /**
   * Set the current propagator.
   *
   * @returns true if the propagator was successfully registered, else false
   */
  setGlobalPropagator(propagator) {
    return (0, global_utils_1$1.registerGlobal)(API_NAME$1, propagator, diag_1$2.DiagAPI.instance());
  }
  /**
   * Inject context into a carrier to be propagated inter-process
   *
   * @param context Context carrying tracing data to inject
   * @param carrier carrier to inject context into
   * @param setter Function used to set values on the carrier
   */
  inject(context, carrier, setter = TextMapPropagator_1$1.defaultTextMapSetter) {
    return this._getGlobalPropagator().inject(context, carrier, setter);
  }
  /**
   * Extract context from a carrier
   *
   * @param context Context which the newly created context will inherit from
   * @param carrier Carrier to extract context from
   * @param getter Function used to extract keys from a carrier
   */
  extract(context, carrier, getter = TextMapPropagator_1$1.defaultTextMapGetter) {
    return this._getGlobalPropagator().extract(context, carrier, getter);
  }
  /**
   * Return a list of all fields which may be used by the propagator.
   */
  fields() {
    return this._getGlobalPropagator().fields();
  }
  /** Remove the global propagator */
  disable() {
    (0, global_utils_1$1.unregisterGlobal)(API_NAME$1, diag_1$2.DiagAPI.instance());
  }
  _getGlobalPropagator() {
    return (0, global_utils_1$1.getGlobal)(API_NAME$1) || NOOP_TEXT_MAP_PROPAGATOR;
  }
}
exports$h.PropagationAPI = PropagationAPI;
var _PropagationAPI = exports$h.PropagationAPI;
var _default$f;
if (typeof exports$h === "object" && exports$h !== null && "default" in exports$h) {
  _default$f = exports$h.default;
} else {
  _default$f = exports$h;
}
const _default_default$f = _default$f;
var __require$f = exports$h;
exports$h.__esModule;
const _mod$4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  PropagationAPI: _PropagationAPI,
  __require: __require$f,
  default: _default_default$f
}, Symbol.toStringTag, { value: "Module" }));
var exports$g = {};
Object.defineProperty(exports$g, "__esModule", {
  value: true
});
Object.defineProperty(exports$g, "__esModule", {
  value: true
});
exports$g.propagation = void 0;
const propagation_1 = __require$f ?? _default_default$f ?? _mod$4;
exports$g.propagation = propagation_1.PropagationAPI.getInstance();
var _propagation = exports$g.propagation;
var _default$e;
if (typeof exports$g === "object" && exports$g !== null && "default" in exports$g) {
  _default$e = exports$g.default;
} else {
  _default$e = exports$g;
}
const _default_default$e = _default$e;
var __require$e = exports$g;
exports$g.__esModule;
const _mod18 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __require: __require$e,
  default: _default_default$e,
  propagation: _propagation
}, Symbol.toStringTag, { value: "Module" }));
var exports$f = {};
Object.defineProperty(exports$f, "__esModule", {
  value: true
});
Object.defineProperty(exports$f, "__esModule", {
  value: true
});
class NoopMeter {
  constructor() {
  }
  /**
   * @see {@link Meter.createGauge}
   */
  createGauge(_name, _options) {
    return exports$f.NOOP_GAUGE_METRIC;
  }
  /**
   * @see {@link Meter.createHistogram}
   */
  createHistogram(_name, _options) {
    return exports$f.NOOP_HISTOGRAM_METRIC;
  }
  /**
   * @see {@link Meter.createCounter}
   */
  createCounter(_name, _options) {
    return exports$f.NOOP_COUNTER_METRIC;
  }
  /**
   * @see {@link Meter.createUpDownCounter}
   */
  createUpDownCounter(_name, _options) {
    return exports$f.NOOP_UP_DOWN_COUNTER_METRIC;
  }
  /**
   * @see {@link Meter.createObservableGauge}
   */
  createObservableGauge(_name, _options) {
    return exports$f.NOOP_OBSERVABLE_GAUGE_METRIC;
  }
  /**
   * @see {@link Meter.createObservableCounter}
   */
  createObservableCounter(_name, _options) {
    return exports$f.NOOP_OBSERVABLE_COUNTER_METRIC;
  }
  /**
   * @see {@link Meter.createObservableUpDownCounter}
   */
  createObservableUpDownCounter(_name, _options) {
    return exports$f.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC;
  }
  /**
   * @see {@link Meter.addBatchObservableCallback}
   */
  addBatchObservableCallback(_callback, _observables) {
  }
  /**
   * @see {@link Meter.removeBatchObservableCallback}
   */
  removeBatchObservableCallback(_callback) {
  }
}
exports$f.NoopMeter = NoopMeter;
class NoopMetric {
}
exports$f.NoopMetric = NoopMetric;
class NoopCounterMetric extends NoopMetric {
  add(_value, _attributes) {
  }
}
exports$f.NoopCounterMetric = NoopCounterMetric;
class NoopUpDownCounterMetric extends NoopMetric {
  add(_value, _attributes) {
  }
}
exports$f.NoopUpDownCounterMetric = NoopUpDownCounterMetric;
class NoopGaugeMetric extends NoopMetric {
  record(_value, _attributes) {
  }
}
exports$f.NoopGaugeMetric = NoopGaugeMetric;
class NoopHistogramMetric extends NoopMetric {
  record(_value, _attributes) {
  }
}
exports$f.NoopHistogramMetric = NoopHistogramMetric;
class NoopObservableMetric {
  addCallback(_callback) {
  }
  removeCallback(_callback) {
  }
}
exports$f.NoopObservableMetric = NoopObservableMetric;
class NoopObservableCounterMetric extends NoopObservableMetric {
}
exports$f.NoopObservableCounterMetric = NoopObservableCounterMetric;
class NoopObservableGaugeMetric extends NoopObservableMetric {
}
exports$f.NoopObservableGaugeMetric = NoopObservableGaugeMetric;
class NoopObservableUpDownCounterMetric extends NoopObservableMetric {
}
exports$f.NoopObservableUpDownCounterMetric = NoopObservableUpDownCounterMetric;
exports$f.NOOP_METER = new NoopMeter();
exports$f.NOOP_COUNTER_METRIC = new NoopCounterMetric();
exports$f.NOOP_GAUGE_METRIC = new NoopGaugeMetric();
exports$f.NOOP_HISTOGRAM_METRIC = new NoopHistogramMetric();
exports$f.NOOP_UP_DOWN_COUNTER_METRIC = new NoopUpDownCounterMetric();
exports$f.NOOP_OBSERVABLE_COUNTER_METRIC = new NoopObservableCounterMetric();
exports$f.NOOP_OBSERVABLE_GAUGE_METRIC = new NoopObservableGaugeMetric();
exports$f.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC = new NoopObservableUpDownCounterMetric();
function createNoopMeter() {
  return exports$f.NOOP_METER;
}
exports$f.createNoopMeter = createNoopMeter;
exports$f.NOOP_GAUGE_METRIC;
exports$f.NOOP_HISTOGRAM_METRIC;
exports$f.NOOP_COUNTER_METRIC;
exports$f.NOOP_UP_DOWN_COUNTER_METRIC;
exports$f.NOOP_OBSERVABLE_GAUGE_METRIC;
exports$f.NOOP_OBSERVABLE_COUNTER_METRIC;
exports$f.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC;
exports$f.NoopMeter;
exports$f.NoopMetric;
exports$f.NoopCounterMetric;
exports$f.NoopUpDownCounterMetric;
exports$f.NoopGaugeMetric;
exports$f.NoopHistogramMetric;
exports$f.NoopObservableMetric;
exports$f.NoopObservableCounterMetric;
exports$f.NoopObservableGaugeMetric;
exports$f.NoopObservableUpDownCounterMetric;
var _NOOP_METER = exports$f.NOOP_METER;
var _createNoopMeter = exports$f.createNoopMeter;
var _default$d;
if (typeof exports$f === "object" && exports$f !== null && "default" in exports$f) {
  _default$d = exports$f.default;
} else {
  _default$d = exports$f;
}
const _default_default$d = _default$d;
var __require$d = exports$f;
exports$f.__esModule;
const _mod5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  NOOP_METER: _NOOP_METER,
  __require: __require$d,
  createNoopMeter: _createNoopMeter,
  default: _default_default$d
}, Symbol.toStringTag, { value: "Module" }));
var exports$e = {};
Object.defineProperty(exports$e, "__esModule", {
  value: true
});
Object.defineProperty(exports$e, "__esModule", {
  value: true
});
const NoopMeter_1$1 = __require$d ?? _default_default$d ?? _mod5;
class NoopMeterProvider {
  getMeter(_name, _version, _options) {
    return NoopMeter_1$1.NOOP_METER;
  }
}
exports$e.NoopMeterProvider = NoopMeterProvider;
exports$e.NOOP_METER_PROVIDER = new NoopMeterProvider();
exports$e.NoopMeterProvider;
var _NOOP_METER_PROVIDER = exports$e.NOOP_METER_PROVIDER;
var _default$c;
if (typeof exports$e === "object" && exports$e !== null && "default" in exports$e) {
  _default$c = exports$e.default;
} else {
  _default$c = exports$e;
}
const _default_default$c = _default$c;
var __require$c = exports$e;
exports$e.__esModule;
const _mod$3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  NOOP_METER_PROVIDER: _NOOP_METER_PROVIDER,
  __require: __require$c,
  default: _default_default$c
}, Symbol.toStringTag, { value: "Module" }));
var exports$d = {};
Object.defineProperty(exports$d, "__esModule", {
  value: true
});
Object.defineProperty(exports$d, "__esModule", {
  value: true
});
exports$d.MetricsAPI = void 0;
const NoopMeterProvider_1 = __require$c ?? _default_default$c ?? _mod$3;
const global_utils_1 = __require$E ?? _default_default$E ?? _mod2$5;
const diag_1$1 = __require$A ?? _default_default$A ?? _mod$a;
const API_NAME = "metrics";
class MetricsAPI {
  /** Empty private constructor prevents end users from constructing a new instance of the API */
  constructor() {
  }
  /** Get the singleton instance of the Metrics API */
  static getInstance() {
    if (!this._instance) {
      this._instance = new MetricsAPI();
    }
    return this._instance;
  }
  /**
   * Set the current global meter provider.
   * Returns true if the meter provider was successfully registered, else false.
   */
  setGlobalMeterProvider(provider) {
    return (0, global_utils_1.registerGlobal)(API_NAME, provider, diag_1$1.DiagAPI.instance());
  }
  /**
   * Returns the global meter provider.
   */
  getMeterProvider() {
    return (0, global_utils_1.getGlobal)(API_NAME) || NoopMeterProvider_1.NOOP_METER_PROVIDER;
  }
  /**
   * Returns a meter from the global meter provider.
   */
  getMeter(name, version2, options2) {
    return this.getMeterProvider().getMeter(name, version2, options2);
  }
  /** Remove the global meter provider */
  disable() {
    (0, global_utils_1.unregisterGlobal)(API_NAME, diag_1$1.DiagAPI.instance());
  }
}
exports$d.MetricsAPI = MetricsAPI;
var _MetricsAPI = exports$d.MetricsAPI;
var _default$b;
if (typeof exports$d === "object" && exports$d !== null && "default" in exports$d) {
  _default$b = exports$d.default;
} else {
  _default$b = exports$d;
}
const _default_default$b = _default$b;
var __require$b = exports$d;
exports$d.__esModule;
const _mod$2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  MetricsAPI: _MetricsAPI,
  __require: __require$b,
  default: _default_default$b
}, Symbol.toStringTag, { value: "Module" }));
var exports$c = {};
Object.defineProperty(exports$c, "__esModule", {
  value: true
});
Object.defineProperty(exports$c, "__esModule", {
  value: true
});
exports$c.metrics = void 0;
const metrics_1 = __require$b ?? _default_default$b ?? _mod$2;
exports$c.metrics = metrics_1.MetricsAPI.getInstance();
var _metrics = exports$c.metrics;
var _default$a;
if (typeof exports$c === "object" && exports$c !== null && "default" in exports$c) {
  _default$a = exports$c.default;
} else {
  _default$a = exports$c;
}
const _default_default$a = _default$a;
var __require$a = exports$c;
exports$c.__esModule;
const _mod17 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __require: __require$a,
  default: _default_default$a,
  metrics: _metrics
}, Symbol.toStringTag, { value: "Module" }));
var exports$b = {};
Object.defineProperty(exports$b, "__esModule", {
  value: true
});
Object.defineProperty(exports$b, "__esModule", {
  value: true
});
exports$b.diag = void 0;
const diag_1 = __require$A ?? _default_default$A ?? _mod$a;
exports$b.diag = diag_1.DiagAPI.instance();
var _diag = exports$b.diag;
var _default$9;
if (typeof exports$b === "object" && exports$b !== null && "default" in exports$b) {
  _default$9 = exports$b.default;
} else {
  _default$9 = exports$b;
}
const _default_default$9 = _default$9;
var __require$9 = exports$b;
exports$b.__esModule;
const _mod16 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __require: __require$9,
  default: _default_default$9,
  diag: _diag
}, Symbol.toStringTag, { value: "Module" }));
var exports$a = {};
Object.defineProperty(exports$a, "__esModule", {
  value: true
});
Object.defineProperty(exports$a, "__esModule", {
  value: true
});
exports$a.context = void 0;
const context_1$1 = __require$x ?? _default_default$x ?? _mod$8;
exports$a.context = context_1$1.ContextAPI.getInstance();
var _context = exports$a.context;
var _default$8;
if (typeof exports$a === "object" && exports$a !== null && "default" in exports$a) {
  _default$8 = exports$a.default;
} else {
  _default$8 = exports$a;
}
const _default_default$8 = _default$8;
var __require$8 = exports$a;
exports$a.__esModule;
const _mod15 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __require: __require$8,
  context: _context,
  default: _default_default$8
}, Symbol.toStringTag, { value: "Module" }));
var exports$9 = {};
Object.defineProperty(exports$9, "__esModule", {
  value: true
});
Object.defineProperty(exports$9, "__esModule", {
  value: true
});
const VALID_KEY_CHAR_RANGE = "[_0-9a-z-*/]";
const VALID_KEY = `[a-z]${VALID_KEY_CHAR_RANGE}{0,255}`;
const VALID_VENDOR_KEY = `[a-z0-9]${VALID_KEY_CHAR_RANGE}{0,240}@[a-z]${VALID_KEY_CHAR_RANGE}{0,13}`;
const VALID_KEY_REGEX = new RegExp(`^(?:${VALID_KEY}|${VALID_VENDOR_KEY})$`);
const VALID_VALUE_BASE_REGEX = /^[ -~]{0,255}[!-~]$/;
const INVALID_VALUE_COMMA_EQUAL_REGEX = /,|=/;
function validateKey(key) {
  return VALID_KEY_REGEX.test(key);
}
exports$9.validateKey = validateKey;
function validateValue(value) {
  return VALID_VALUE_BASE_REGEX.test(value) && !INVALID_VALUE_COMMA_EQUAL_REGEX.test(value);
}
exports$9.validateValue = validateValue;
var _validateKey = exports$9.validateKey;
var _validateValue = exports$9.validateValue;
var _default$7;
if (typeof exports$9 === "object" && exports$9 !== null && "default" in exports$9) {
  _default$7 = exports$9.default;
} else {
  _default$7 = exports$9;
}
const _default_default$7 = _default$7;
var __require$7 = exports$9;
exports$9.__esModule;
const _mod$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __require: __require$7,
  default: _default_default$7,
  validateKey: _validateKey,
  validateValue: _validateValue
}, Symbol.toStringTag, { value: "Module" }));
var exports$8 = {};
Object.defineProperty(exports$8, "__esModule", {
  value: true
});
Object.defineProperty(exports$8, "__esModule", {
  value: true
});
exports$8.TraceStateImpl = void 0;
const tracestate_validators_1 = __require$7 ?? _default_default$7 ?? _mod$1;
const MAX_TRACE_STATE_ITEMS = 32;
const MAX_TRACE_STATE_LEN = 512;
const LIST_MEMBERS_SEPARATOR = ",";
const LIST_MEMBER_KEY_VALUE_SPLITTER = "=";
class TraceStateImpl {
  constructor(rawTraceState) {
    this._internalState = /* @__PURE__ */ new Map();
    if (rawTraceState) this._parse(rawTraceState);
  }
  set(key, value) {
    const traceState = this._clone();
    if (traceState._internalState.has(key)) {
      traceState._internalState.delete(key);
    }
    traceState._internalState.set(key, value);
    return traceState;
  }
  unset(key) {
    const traceState = this._clone();
    traceState._internalState.delete(key);
    return traceState;
  }
  get(key) {
    return this._internalState.get(key);
  }
  serialize() {
    return Array.from(this._internalState.keys()).reduceRight((agg, key) => {
      agg.push(key + LIST_MEMBER_KEY_VALUE_SPLITTER + this.get(key));
      return agg;
    }, []).join(LIST_MEMBERS_SEPARATOR);
  }
  _parse(rawTraceState) {
    if (rawTraceState.length > MAX_TRACE_STATE_LEN) return;
    this._internalState = rawTraceState.split(LIST_MEMBERS_SEPARATOR).reduceRight((agg, part) => {
      const listMember = part.trim();
      const i2 = listMember.indexOf(LIST_MEMBER_KEY_VALUE_SPLITTER);
      if (i2 !== -1) {
        const key = listMember.slice(0, i2);
        const value = listMember.slice(i2 + 1, part.length);
        if ((0, tracestate_validators_1.validateKey)(key) && (0, tracestate_validators_1.validateValue)(value)) {
          agg.set(key, value);
        }
      }
      return agg;
    }, /* @__PURE__ */ new Map());
    if (this._internalState.size > MAX_TRACE_STATE_ITEMS) {
      this._internalState = new Map(Array.from(this._internalState.entries()).reverse().slice(0, MAX_TRACE_STATE_ITEMS));
    }
  }
  // @ts-expect-error TS6133 Accessed in tests only.
  _keys() {
    return Array.from(this._internalState.keys()).reverse();
  }
  _clone() {
    const traceState = new TraceStateImpl();
    traceState._internalState = new Map(this._internalState);
    return traceState;
  }
}
exports$8.TraceStateImpl = TraceStateImpl;
var _TraceStateImpl = exports$8.TraceStateImpl;
var _default$6;
if (typeof exports$8 === "object" && exports$8 !== null && "default" in exports$8) {
  _default$6 = exports$8.default;
} else {
  _default$6 = exports$8;
}
const _default_default$6 = _default$6;
var __require$6 = exports$8;
exports$8.__esModule;
const _mod = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  TraceStateImpl: _TraceStateImpl,
  __require: __require$6,
  default: _default_default$6
}, Symbol.toStringTag, { value: "Module" }));
var exports$7 = {};
Object.defineProperty(exports$7, "__esModule", {
  value: true
});
Object.defineProperty(exports$7, "__esModule", {
  value: true
});
exports$7.createTraceState = void 0;
const tracestate_impl_1 = __require$6 ?? _default_default$6 ?? _mod;
function createTraceState(rawTraceState) {
  return new tracestate_impl_1.TraceStateImpl(rawTraceState);
}
exports$7.createTraceState = createTraceState;
var _createTraceState = exports$7.createTraceState;
var _default$5;
if (typeof exports$7 === "object" && exports$7 !== null && "default" in exports$7) {
  _default$5 = exports$7.default;
} else {
  _default$5 = exports$7;
}
const _default_default$5 = _default$5;
var __require$5 = exports$7;
exports$7.__esModule;
const _mod12 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __require: __require$5,
  createTraceState: _createTraceState,
  default: _default_default$5
}, Symbol.toStringTag, { value: "Module" }));
var exports$6 = {};
Object.defineProperty(exports$6, "__esModule", {
  value: true
});
Object.defineProperty(exports$6, "__esModule", {
  value: true
});
exports$6.SpanStatusCode = void 0;
(function(SpanStatusCode) {
  SpanStatusCode[SpanStatusCode["UNSET"] = 0] = "UNSET";
  SpanStatusCode[SpanStatusCode["OK"] = 1] = "OK";
  SpanStatusCode[SpanStatusCode["ERROR"] = 2] = "ERROR";
})(exports$6.SpanStatusCode || (exports$6.SpanStatusCode = {}));
var _SpanStatusCode$1 = exports$6.SpanStatusCode;
var _default$4;
if (typeof exports$6 === "object" && exports$6 !== null && "default" in exports$6) {
  _default$4 = exports$6.default;
} else {
  _default$4 = exports$6;
}
const _default_default$4 = _default$4;
var __require$4 = exports$6;
exports$6.__esModule;
const _mod10 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  SpanStatusCode: _SpanStatusCode$1,
  __require: __require$4,
  default: _default_default$4
}, Symbol.toStringTag, { value: "Module" }));
var exports$5 = {};
Object.defineProperty(exports$5, "__esModule", {
  value: true
});
Object.defineProperty(exports$5, "__esModule", {
  value: true
});
exports$5.SpanKind = void 0;
(function(SpanKind) {
  SpanKind[SpanKind["INTERNAL"] = 0] = "INTERNAL";
  SpanKind[SpanKind["SERVER"] = 1] = "SERVER";
  SpanKind[SpanKind["CLIENT"] = 2] = "CLIENT";
  SpanKind[SpanKind["PRODUCER"] = 3] = "PRODUCER";
  SpanKind[SpanKind["CONSUMER"] = 4] = "CONSUMER";
})(exports$5.SpanKind || (exports$5.SpanKind = {}));
var _SpanKind = exports$5.SpanKind;
var _default$3;
if (typeof exports$5 === "object" && exports$5 !== null && "default" in exports$5) {
  _default$3 = exports$5.default;
} else {
  _default$3 = exports$5;
}
const _default_default$3 = _default$3;
var __require$3 = exports$5;
exports$5.__esModule;
const _mod1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  SpanKind: _SpanKind,
  __require: __require$3,
  default: _default_default$3
}, Symbol.toStringTag, { value: "Module" }));
var exports$4 = {};
Object.defineProperty(exports$4, "__esModule", {
  value: true
});
Object.defineProperty(exports$4, "__esModule", {
  value: true
});
exports$4.SamplingDecision = void 0;
(function(SamplingDecision) {
  SamplingDecision[SamplingDecision["NOT_RECORD"] = 0] = "NOT_RECORD";
  SamplingDecision[SamplingDecision["RECORD"] = 1] = "RECORD";
  SamplingDecision[SamplingDecision["RECORD_AND_SAMPLED"] = 2] = "RECORD_AND_SAMPLED";
})(exports$4.SamplingDecision || (exports$4.SamplingDecision = {}));
var _SamplingDecision = exports$4.SamplingDecision;
var _default$2;
if (typeof exports$4 === "object" && exports$4 !== null && "default" in exports$4) {
  _default$2 = exports$4.default;
} else {
  _default$2 = exports$4;
}
const _default_default$2 = _default$2;
var __require$2 = exports$4;
exports$4.__esModule;
const _mod0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  SamplingDecision: _SamplingDecision,
  __require: __require$2,
  default: _default_default$2
}, Symbol.toStringTag, { value: "Module" }));
var exports$3 = {};
Object.defineProperty(exports$3, "__esModule", {
  value: true
});
Object.defineProperty(exports$3, "__esModule", {
  value: true
});
exports$3.ValueType = void 0;
(function(ValueType) {
  ValueType[ValueType["INT"] = 0] = "INT";
  ValueType[ValueType["DOUBLE"] = 1] = "DOUBLE";
})(exports$3.ValueType || (exports$3.ValueType = {}));
var _ValueType = exports$3.ValueType;
var _default$1;
if (typeof exports$3 === "object" && exports$3 !== null && "default" in exports$3) {
  _default$1 = exports$3.default;
} else {
  _default$1 = exports$3;
}
const _default_default$1 = _default$1;
var __require$1 = exports$3;
exports$3.__esModule;
const _mod6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ValueType: _ValueType,
  __require: __require$1,
  default: _default_default$1
}, Symbol.toStringTag, { value: "Module" }));
var exports$2 = {};
Object.defineProperty(exports$2, "__esModule", {
  value: true
});
Object.defineProperty(exports$2, "__esModule", {
  value: true
});
const consoleMap = [{
  n: "error",
  c: "error"
}, {
  n: "warn",
  c: "warn"
}, {
  n: "info",
  c: "info"
}, {
  n: "debug",
  c: "debug"
}, {
  n: "verbose",
  c: "trace"
}];
exports$2._originalConsoleMethods = {};
if (typeof console !== "undefined") {
  const keys = ["error", "warn", "info", "debug", "trace", "log"];
  for (const key of keys) {
    if (typeof console[key] === "function") {
      exports$2._originalConsoleMethods[key] = console[key];
    }
  }
}
class DiagConsoleLogger {
  constructor() {
    function _consoleFunc(funcName) {
      return function(...args) {
        let theFunc = exports$2._originalConsoleMethods[funcName];
        if (typeof theFunc !== "function") {
          theFunc = exports$2._originalConsoleMethods["log"];
        }
        if (typeof theFunc !== "function" && console) {
          theFunc = console[funcName];
          if (typeof theFunc !== "function") {
            theFunc = console.log;
          }
        }
        if (typeof theFunc === "function") {
          return theFunc.apply(console, args);
        }
      };
    }
    for (let i2 = 0; i2 < consoleMap.length; i2++) {
      this[consoleMap[i2].n] = _consoleFunc(consoleMap[i2].c);
    }
  }
}
exports$2.DiagConsoleLogger = DiagConsoleLogger;
exports$2._originalConsoleMethods;
var _DiagConsoleLogger = exports$2.DiagConsoleLogger;
var _default;
if (typeof exports$2 === "object" && exports$2 !== null && "default" in exports$2) {
  _default = exports$2.default;
} else {
  _default = exports$2;
}
const _default_default = _default;
var __require = exports$2;
exports$2.__esModule;
const _mod3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  DiagConsoleLogger: _DiagConsoleLogger,
  __require,
  default: _default_default
}, Symbol.toStringTag, { value: "Module" }));
var exports$1 = {};
Object.defineProperty(exports$1, "__esModule", {
  value: true
});
Object.defineProperty(exports$1, "__esModule", {
  value: true
});
var utils_1 = __require$j ?? _default_default$j ?? _mod$5;
exports$1.baggageEntryMetadataFromString = utils_1.baggageEntryMetadataFromString;
var context_1 = __require$z ?? _default_default$z ?? _mod2$3;
exports$1.createContextKey = context_1.createContextKey;
exports$1.ROOT_CONTEXT = context_1.ROOT_CONTEXT;
var consoleLogger_1 = __require ?? _default_default ?? _mod3;
exports$1.DiagConsoleLogger = consoleLogger_1.DiagConsoleLogger;
var types_1 = __require$D ?? _default_default$D ?? _mod4$2;
exports$1.DiagLogLevel = types_1.DiagLogLevel;
var NoopMeter_1 = __require$d ?? _default_default$d ?? _mod5;
exports$1.createNoopMeter = NoopMeter_1.createNoopMeter;
var Metric_1 = __require$1 ?? _default_default$1 ?? _mod6;
exports$1.ValueType = Metric_1.ValueType;
var TextMapPropagator_1 = __require$h ?? _default_default$h ?? _mod7;
exports$1.defaultTextMapGetter = TextMapPropagator_1.defaultTextMapGetter;
exports$1.defaultTextMapSetter = TextMapPropagator_1.defaultTextMapSetter;
var ProxyTracer_1 = __require$p ?? _default_default$p ?? _mod8;
exports$1.ProxyTracer = ProxyTracer_1.ProxyTracer;
var ProxyTracerProvider_1 = __require$o ?? _default_default$o ?? _mod9;
exports$1.ProxyTracerProvider = ProxyTracerProvider_1.ProxyTracerProvider;
var SamplingResult_1 = __require$2 ?? _default_default$2 ?? _mod0;
exports$1.SamplingDecision = SamplingResult_1.SamplingDecision;
var span_kind_1 = __require$3 ?? _default_default$3 ?? _mod1;
exports$1.SpanKind = span_kind_1.SpanKind;
var status_1 = __require$4 ?? _default_default$4 ?? _mod10;
exports$1.SpanStatusCode = status_1.SpanStatusCode;
var trace_flags_1 = __require$w ?? _default_default$w ?? _mod11;
exports$1.TraceFlags = trace_flags_1.TraceFlags;
var utils_2 = __require$5 ?? _default_default$5 ?? _mod12;
exports$1.createTraceState = utils_2.createTraceState;
var spancontext_utils_1 = __require$s ?? _default_default$s ?? _mod13;
exports$1.isSpanContextValid = spancontext_utils_1.isSpanContextValid;
exports$1.isValidTraceId = spancontext_utils_1.isValidTraceId;
exports$1.isValidSpanId = spancontext_utils_1.isValidSpanId;
var invalid_span_constants_1 = __require$v ?? _default_default$v ?? _mod14;
exports$1.INVALID_SPANID = invalid_span_constants_1.INVALID_SPANID;
exports$1.INVALID_TRACEID = invalid_span_constants_1.INVALID_TRACEID;
exports$1.INVALID_SPAN_CONTEXT = invalid_span_constants_1.INVALID_SPAN_CONTEXT;
const context_api_1 = __require$8 ?? _default_default$8 ?? _mod15;
exports$1.context = context_api_1.context;
const diag_api_1 = __require$9 ?? _default_default$9 ?? _mod16;
exports$1.diag = diag_api_1.diag;
const metrics_api_1 = __require$a ?? _default_default$a ?? _mod17;
exports$1.metrics = metrics_api_1.metrics;
const propagation_api_1 = __require$e ?? _default_default$e ?? _mod18;
exports$1.propagation = propagation_api_1.propagation;
const trace_api_1 = __require$m ?? _default_default$m ?? _mod19;
exports$1.trace = trace_api_1.trace;
exports$1.default = {
  context: context_api_1.context,
  diag: diag_api_1.diag,
  metrics: metrics_api_1.metrics,
  propagation: propagation_api_1.propagation,
  trace: trace_api_1.trace
};
exports$1.baggageEntryMetadataFromString;
exports$1.createContextKey;
exports$1.ROOT_CONTEXT;
exports$1.DiagConsoleLogger;
exports$1.DiagLogLevel;
exports$1.createNoopMeter;
exports$1.ValueType;
exports$1.defaultTextMapGetter;
exports$1.defaultTextMapSetter;
exports$1.ProxyTracer;
exports$1.ProxyTracerProvider;
exports$1.SamplingDecision;
exports$1.SpanKind;
var _SpanStatusCode = exports$1.SpanStatusCode;
exports$1.TraceFlags;
exports$1.createTraceState;
var _isSpanContextValid = exports$1.isSpanContextValid;
exports$1.isValidTraceId;
exports$1.isValidSpanId;
exports$1.INVALID_SPANID;
exports$1.INVALID_TRACEID;
exports$1.INVALID_SPAN_CONTEXT;
exports$1.context;
exports$1.diag;
exports$1.metrics;
exports$1.propagation;
var _trace = exports$1.trace;
if (typeof exports$1 === "object" && exports$1 !== null && "default" in exports$1) {
  exports$1.default;
}
exports$1.__esModule;
let BUILD_ID = "fd48e6ddb5520bafe518b15f5cb3cd93d94369bb";
const DENO_DEPLOYMENT_ID$1 = void 0;
function setBuildId(id) {
  BUILD_ID = id;
}
const {
  Deno: Deno$2
} = globalThis;
const noColor$1 = typeof Deno$2?.noColor === "boolean" ? Deno$2.noColor : false;
let enabled$1 = !noColor$1;
function code$1(open, close) {
  return {
    open: `\x1B[${open.join(";")}m`,
    close: `\x1B[${close}m`,
    regexp: new RegExp(`\\x1b\\[${close}m`, "g")
  };
}
function run$1(str, code2) {
  return enabled$1 ? `${code2.open}${str.replace(code2.regexp, code2.open)}${code2.close}` : str;
}
function bold(str) {
  return run$1(str, code$1([1], 22));
}
function cyan(str) {
  return run$1(str, code$1([36], 39));
}
function clampAndTruncate(n2, max = 255, min = 0) {
  return Math.trunc(Math.max(Math.min(n2, max), min));
}
function rgb8(str, color) {
  return run$1(str, code$1([38, 5, clampAndTruncate(color)], 39));
}
function bgRgb8(str, color) {
  return run$1(str, code$1([48, 5, clampAndTruncate(color)], 49));
}
var n$1, l$3, u$3, t$2, i$3, r$2, o$3, e$1, f$3, c$3, a$3, s$3, h$2, p$3, v$2, y$2, d$2 = {}, w$2 = [], _$1 = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i, g$2 = Array.isArray;
function m$2(n2, l2) {
  for (var u2 in l2) n2[u2] = l2[u2];
  return n2;
}
function b$1(n2) {
  n2 && n2.parentNode && n2.parentNode.removeChild(n2);
}
function k$2(l2, u2, t2) {
  var i2, r2, o2, e2 = {};
  for (o2 in u2) "key" == o2 ? i2 = u2[o2] : "ref" == o2 ? r2 = u2[o2] : e2[o2] = u2[o2];
  if (arguments.length > 2 && (e2.children = arguments.length > 3 ? n$1.call(arguments, 2) : t2), "function" == typeof l2 && null != l2.defaultProps) for (o2 in l2.defaultProps) void 0 === e2[o2] && (e2[o2] = l2.defaultProps[o2]);
  return x$2(l2, e2, i2, r2, null);
}
function x$2(n2, t2, i2, r2, o2) {
  var e2 = {
    type: n2,
    props: t2,
    key: i2,
    ref: r2,
    __k: null,
    __: null,
    __b: 0,
    __e: null,
    __c: null,
    constructor: void 0,
    __v: null == o2 ? ++u$3 : o2,
    __i: -1,
    __u: 0
  };
  return null == o2 && null != l$3.vnode && l$3.vnode(e2), e2;
}
function S(n2) {
  return n2.children;
}
function C$2(n2, l2) {
  this.props = n2, this.context = l2;
}
function $$1(n2, l2) {
  if (null == l2) return n2.__ ? $$1(n2.__, n2.__i + 1) : null;
  for (var u2; l2 < n2.__k.length; l2++) if (null != (u2 = n2.__k[l2]) && null != u2.__e) return u2.__e;
  return "function" == typeof n2.type ? $$1(n2) : null;
}
function I$1(n2) {
  if (n2.__P && n2.__d) {
    var u2 = n2.__v, t2 = u2.__e, i2 = [], r2 = [], o2 = m$2({}, u2);
    o2.__v = u2.__v + 1, l$3.vnode && l$3.vnode(o2), q$2(n2.__P, o2, u2, n2.__n, n2.__P.namespaceURI, 32 & u2.__u ? [t2] : null, i2, null == t2 ? $$1(u2) : t2, !!(32 & u2.__u), r2), o2.__v = u2.__v, o2.__.__k[o2.__i] = o2, D$2(i2, o2, r2), u2.__e = u2.__ = null, o2.__e != t2 && P$1(o2);
  }
}
function P$1(n2) {
  if (null != (n2 = n2.__) && null != n2.__c) return n2.__e = n2.__c.base = null, n2.__k.some(function(l2) {
    if (null != l2 && null != l2.__e) return n2.__e = n2.__c.base = l2.__e;
  }), P$1(n2);
}
function A$2(n2) {
  (!n2.__d && (n2.__d = true) && i$3.push(n2) && !H$1.__r++ || r$2 != l$3.debounceRendering) && ((r$2 = l$3.debounceRendering) || o$3)(H$1);
}
function H$1() {
  try {
    for (var n2, l2 = 1; i$3.length; ) i$3.length > l2 && i$3.sort(e$1), n2 = i$3.shift(), l2 = i$3.length, I$1(n2);
  } finally {
    i$3.length = H$1.__r = 0;
  }
}
function L(n2, l2, u2, t2, i2, r2, o2, e2, f2, c2, a2) {
  var s2, h2, p2, v2, y2, _2, g2 = t2 && t2.__k || w$2, m2 = l2.length;
  for (f2 = T$1(u2, l2, g2, f2, m2), s2 = 0; s2 < m2; s2++) null != (p2 = u2.__k[s2]) && (h2 = -1 != p2.__i && g2[p2.__i] || d$2, p2.__i = s2, _2 = q$2(n2, p2, h2, i2, r2, o2, e2, f2, c2, a2), v2 = p2.__e, p2.ref && h2.ref != p2.ref && (h2.ref && J$1(h2.ref, null, p2), a2.push(p2.ref, p2.__c || v2, p2)), null == y2 && null != v2 && (y2 = v2), 4 & p2.__u ? (f2 = j$1(p2, f2, n2), h2.__e && (h2.__e = null)) : "function" == typeof p2.type && void 0 !== _2 ? f2 = _2 : v2 && (f2 = v2.nextSibling), p2.__u &= -7);
  return u2.__e = y2, f2;
}
function T$1(n2, l2, u2, t2, i2) {
  var r2, o2, e2, f2, c2, a2 = u2.length, s2 = a2, h2 = 0;
  for (n2.__k = new Array(i2), r2 = 0; r2 < i2; r2++) null != (o2 = l2[r2]) && "boolean" != typeof o2 && "function" != typeof o2 ? ("string" == typeof o2 || "number" == typeof o2 || "bigint" == typeof o2 || o2.constructor == String ? o2 = n2.__k[r2] = x$2(null, o2, null, null, null) : g$2(o2) ? o2 = n2.__k[r2] = x$2(S, {
    children: o2
  }, null, null, null) : void 0 === o2.constructor && o2.__b > 0 ? o2 = n2.__k[r2] = x$2(o2.type, o2.props, o2.key, o2.ref ? o2.ref : null, o2.__v) : n2.__k[r2] = o2, f2 = r2 + h2, o2.__ = n2, o2.__b = n2.__b + 1, e2 = null, -1 != (c2 = o2.__i = O$1(o2, u2, f2, s2)) && (s2--, (e2 = u2[c2]) && (e2.__u |= 2)), null == e2 || null == e2.__v ? (-1 == c2 && (i2 > a2 ? h2-- : i2 < a2 && h2++), "function" != typeof o2.type && (o2.__u |= 4)) : c2 != f2 && (c2 == f2 - 1 ? h2-- : c2 == f2 + 1 ? h2++ : (c2 > f2 ? h2-- : h2++, o2.__u |= 4))) : n2.__k[r2] = null;
  if (s2) for (r2 = 0; r2 < a2; r2++) null != (e2 = u2[r2]) && 0 == (2 & e2.__u) && (e2.__e == t2 && (t2 = $$1(e2)), K(e2, e2));
  return t2;
}
function j$1(n2, l2, u2) {
  var t2, i2;
  if ("function" == typeof n2.type) {
    for (t2 = n2.__k, i2 = 0; t2 && i2 < t2.length; i2++) t2[i2] && (t2[i2].__ = n2, l2 = j$1(t2[i2], l2, u2));
    return l2;
  }
  n2.__e != l2 && (l2 && n2.type && !l2.parentNode && (l2 = $$1(n2)), l2 = u2.insertBefore(n2.__e, l2 || null));
  do {
    l2 = l2 && l2.nextSibling;
  } while (null != l2 && 8 == l2.nodeType);
  return l2;
}
function O$1(n2, l2, u2, t2) {
  var i2, r2, o2, e2 = n2.key, f2 = n2.type, c2 = l2[u2], a2 = null != c2 && 0 == (2 & c2.__u);
  if (null === c2 && null == e2 || a2 && e2 == c2.key && f2 == c2.type) return u2;
  if (t2 > (a2 ? 1 : 0)) {
    for (i2 = u2 - 1, r2 = u2 + 1; i2 >= 0 || r2 < l2.length; ) if (null != (c2 = l2[o2 = i2 >= 0 ? i2-- : r2++]) && 0 == (2 & c2.__u) && e2 == c2.key && f2 == c2.type) return o2;
  }
  return -1;
}
function z$2(n2, l2, u2) {
  "-" == l2[0] ? n2.setProperty(l2, null == u2 ? "" : u2) : n2[l2] = null == u2 ? "" : "number" != typeof u2 || _$1.test(l2) ? u2 : u2 + "px";
}
function N$1(n2, l2, u2, t2, i2) {
  var r2, o2;
  n: if ("style" == l2) {
    if ("string" == typeof u2) n2.style.cssText = u2;
    else {
      if ("string" == typeof t2 && (n2.style.cssText = t2 = ""), t2) for (l2 in t2) u2 && l2 in u2 || z$2(n2.style, l2, "");
      if (u2) for (l2 in u2) t2 && u2[l2] == t2[l2] || z$2(n2.style, l2, u2[l2]);
    }
  } else if ("o" == l2[0] && "n" == l2[1]) r2 = l2 != (l2 = l2.replace(s$3, "$1")), o2 = l2.toLowerCase(), l2 = o2 in n2 || "onFocusOut" == l2 || "onFocusIn" == l2 ? o2.slice(2) : l2.slice(2), n2.l || (n2.l = {}), n2.l[l2 + r2] = u2, u2 ? t2 ? u2[a$3] = t2[a$3] : (u2[a$3] = h$2, n2.addEventListener(l2, r2 ? v$2 : p$3, r2)) : n2.removeEventListener(l2, r2 ? v$2 : p$3, r2);
  else {
    if ("http://www.w3.org/2000/svg" == i2) l2 = l2.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
    else if ("width" != l2 && "height" != l2 && "href" != l2 && "list" != l2 && "form" != l2 && "tabIndex" != l2 && "download" != l2 && "rowSpan" != l2 && "colSpan" != l2 && "role" != l2 && "popover" != l2 && l2 in n2) try {
      n2[l2] = null == u2 ? "" : u2;
      break n;
    } catch (n3) {
    }
    "function" == typeof u2 || (null == u2 || false === u2 && "-" != l2[4] ? n2.removeAttribute(l2) : n2.setAttribute(l2, "popover" == l2 && 1 == u2 ? "" : u2));
  }
}
function V$1(n2) {
  return function(u2) {
    if (this.l) {
      var t2 = this.l[u2.type + n2];
      if (null == u2[c$3]) u2[c$3] = h$2++;
      else if (u2[c$3] < t2[a$3]) return;
      return t2(l$3.event ? l$3.event(u2) : u2);
    }
  };
}
function q$2(n2, u2, t2, i2, r2, o2, e2, f2, c2, a2) {
  var s2, h2, p2, v2, y2, d2, _2, k2, x2, M2, I2, P2, A2, H2, T2, j2, F2 = u2.type;
  if (void 0 !== u2.constructor) return null;
  128 & t2.__u && (c2 = !!(32 & t2.__u), o2 = [f2 = u2.__e = t2.__e]), (s2 = l$3.__b) && s2(u2);
  n: if ("function" == typeof F2) {
    h2 = e2.length;
    try {
      if (x2 = u2.props, M2 = F2.prototype && F2.prototype.render, I2 = (s2 = F2.contextType) && i2[s2.__c], P2 = s2 ? I2 ? I2.props.value : s2.__ : i2, t2.__c ? k2 = (p2 = u2.__c = t2.__c).__ = p2.__E : (M2 ? u2.__c = p2 = new F2(x2, P2) : (u2.__c = p2 = new C$2(x2, P2), p2.constructor = F2, p2.render = Q), I2 && I2.sub(p2), p2.state || (p2.state = {}), p2.__n = i2, v2 = p2.__d = true, p2.__h = [], p2._sb = []), M2 && null == p2.__s && (p2.__s = p2.state), M2 && null != F2.getDerivedStateFromProps && (p2.__s == p2.state && (p2.__s = m$2({}, p2.__s)), m$2(p2.__s, F2.getDerivedStateFromProps(x2, p2.__s))), y2 = p2.props, d2 = p2.state, p2.__v = u2, v2) M2 && null == F2.getDerivedStateFromProps && null != p2.componentWillMount && p2.componentWillMount(), M2 && null != p2.componentDidMount && p2.__h.push(p2.componentDidMount);
      else {
        if (M2 && null == F2.getDerivedStateFromProps && x2 !== y2 && null != p2.componentWillReceiveProps && p2.componentWillReceiveProps(x2, P2), u2.__v == t2.__v || !p2.__e && null != p2.shouldComponentUpdate && false === p2.shouldComponentUpdate(x2, p2.__s, P2)) {
          u2.__v != t2.__v && (p2.props = x2, p2.state = p2.__s, p2.__d = false), u2.__e = t2.__e, u2.__k = t2.__k, u2.__k.some(function(n3) {
            n3 && (n3.__ = u2);
          }), w$2.push.apply(p2.__h, p2._sb), p2._sb = [], p2.__h.length && e2.push(p2), f2 = $$1(t2);
          break n;
        }
        null != p2.componentWillUpdate && p2.componentWillUpdate(x2, p2.__s, P2), M2 && null != p2.componentDidUpdate && p2.__h.push(function() {
          p2.componentDidUpdate(y2, d2, _2);
        });
      }
      if (p2.context = P2, p2.props = x2, p2.__P = n2, p2.__e = false, A2 = l$3.__r, H2 = 0, M2) p2.state = p2.__s, p2.__d = false, A2 && A2(u2), s2 = p2.render(p2.props, p2.state, p2.context), w$2.push.apply(p2.__h, p2._sb), p2._sb = [];
      else do {
        p2.__d = false, A2 && A2(u2), s2 = p2.render(p2.props, p2.state, p2.context), p2.state = p2.__s;
      } while (p2.__d && ++H2 < 25);
      p2.state = p2.__s, null != p2.getChildContext && (i2 = m$2(m$2({}, i2), p2.getChildContext())), M2 && !v2 && null != p2.getSnapshotBeforeUpdate && (_2 = p2.getSnapshotBeforeUpdate(y2, d2)), T2 = null != s2 && s2.type === S && null == s2.key ? E(s2.props.children) : s2, f2 = L(n2, g$2(T2) ? T2 : [T2], u2, t2, i2, r2, o2, e2, f2, c2, a2), p2.base = u2.__e, u2.__u &= -161, p2.__h.length && e2.push(p2), k2 && (p2.__E = p2.__ = null);
    } catch (n3) {
      if (e2.length = h2, u2.__v = null, c2 || null != o2) {
        if (n3.then) {
          for (u2.__u |= c2 ? 160 : 128; f2 && 8 == f2.nodeType && f2.nextSibling; ) f2 = f2.nextSibling;
          null != o2 && (o2[o2.indexOf(f2)] = null), u2.__e = f2;
        } else if (null != o2) for (j2 = o2.length; j2--; ) b$1(o2[j2]);
      } else u2.__e = t2.__e;
      null == u2.__k && (u2.__k = t2.__k || []), n3.then || B$2(u2), l$3.__e(n3, u2, t2);
    }
  } else null == o2 && u2.__v == t2.__v ? (u2.__k = t2.__k, u2.__e = t2.__e) : f2 = u2.__e = G(t2.__e, u2, t2, i2, r2, o2, e2, c2, a2);
  return (s2 = l$3.diffed) && s2(u2), 128 & u2.__u ? void 0 : f2;
}
function B$2(n2) {
  n2 && (n2.__c && (n2.__c.__e = true), n2.__k && n2.__k.some(B$2));
}
function D$2(n2, u2, t2) {
  for (var i2 = 0; i2 < t2.length; i2++) J$1(t2[i2], t2[++i2], t2[++i2]);
  l$3.__c && l$3.__c(u2, n2), n2.some(function(u3) {
    try {
      n2 = u3.__h, u3.__h = [], n2.some(function(n3) {
        n3.call(u3);
      });
    } catch (n3) {
      l$3.__e(n3, u3.__v);
    }
  });
}
function E(n2) {
  return "object" != typeof n2 || null == n2 || n2.__b > 0 ? n2 : g$2(n2) ? n2.map(E) : void 0 !== n2.constructor ? null : m$2({}, n2);
}
function G(u2, t2, i2, r2, o2, e2, f2, c2, a2) {
  var s2, h2, p2, v2, y2, w2, _2, m2 = i2.props || d$2, k2 = t2.props, x2 = t2.type;
  if ("svg" == x2 ? o2 = "http://www.w3.org/2000/svg" : "math" == x2 ? o2 = "http://www.w3.org/1998/Math/MathML" : o2 || (o2 = "http://www.w3.org/1999/xhtml"), null != e2) {
    for (s2 = 0; s2 < e2.length; s2++) if ((y2 = e2[s2]) && "setAttribute" in y2 == !!x2 && (x2 ? y2.localName == x2 : 3 == y2.nodeType)) {
      u2 = y2, e2[s2] = null;
      break;
    }
  }
  if (null == u2) {
    if (null == x2) return document.createTextNode(k2);
    u2 = document.createElementNS(o2, x2, k2.is && k2), c2 && (l$3.__m && l$3.__m(t2, e2), c2 = false), e2 = null;
  }
  if (null == x2) m2 === k2 || c2 && u2.data == k2 || (u2.data = k2);
  else {
    if (e2 = "textarea" == x2 && null != k2.defaultValue ? null : e2 && n$1.call(u2.childNodes), !c2 && null != e2) for (m2 = {}, s2 = 0; s2 < u2.attributes.length; s2++) m2[(y2 = u2.attributes[s2]).name] = y2.value;
    for (s2 in m2) y2 = m2[s2], "dangerouslySetInnerHTML" == s2 ? p2 = y2 : "children" == s2 || s2 in k2 || "value" == s2 && "defaultValue" in k2 || "checked" == s2 && "defaultChecked" in k2 || N$1(u2, s2, null, y2, o2);
    for (s2 in k2) y2 = k2[s2], "children" == s2 ? v2 = y2 : "dangerouslySetInnerHTML" == s2 ? h2 = y2 : "value" == s2 ? w2 = y2 : "checked" == s2 ? _2 = y2 : c2 && "function" != typeof y2 || m2[s2] === y2 || N$1(u2, s2, y2, m2[s2], o2);
    if (h2) c2 || p2 && (h2.__html == p2.__html || h2.__html == u2.innerHTML) || (u2.innerHTML = h2.__html), t2.__k = [];
    else if (p2 && (u2.innerHTML = ""), L("template" == t2.type ? u2.content : u2, g$2(v2) ? v2 : [v2], t2, i2, r2, "foreignObject" == x2 ? "http://www.w3.org/1999/xhtml" : o2, e2, f2, e2 ? e2[0] : i2.__k && $$1(i2, 0), c2, a2), null != e2) for (s2 = e2.length; s2--; ) b$1(e2[s2]);
    c2 && "textarea" != x2 || (s2 = "value", "progress" == x2 && null == w2 ? u2.removeAttribute("value") : null != w2 && (w2 !== u2[s2] || "progress" == x2 && !w2 || "option" == x2 && w2 != m2[s2]) && N$1(u2, s2, w2, m2[s2], o2), s2 = "checked", null != _2 && _2 != u2[s2] && N$1(u2, s2, _2, m2[s2], o2));
  }
  return u2;
}
function J$1(n2, u2, t2) {
  try {
    if ("function" == typeof n2) {
      var i2 = "function" == typeof n2.__u;
      i2 && n2.__u(), i2 && null == u2 || (n2.__u = n2(u2));
    } else n2.current = u2;
  } catch (n3) {
    l$3.__e(n3, t2);
  }
}
function K(n2, u2, t2) {
  var i2, r2;
  if (l$3.unmount && l$3.unmount(n2), (i2 = n2.ref) && (i2.current && i2.current != n2.__e || J$1(i2, null, u2)), null != (i2 = n2.__c)) {
    if (i2.componentWillUnmount) try {
      i2.componentWillUnmount();
    } catch (n3) {
      l$3.__e(n3, u2);
    }
    i2.base = i2.__P = i2.__n = null;
  }
  if (i2 = n2.__k) for (r2 = 0; r2 < i2.length; r2++) i2[r2] && K(i2[r2], u2, t2 || "function" != typeof n2.type);
  t2 || b$1(n2.__e), n2.__c = n2.__ = n2.__e = void 0;
}
function Q(n2, l2, u2) {
  return this.constructor(n2, u2);
}
function X(n2) {
  function l2(n3) {
    var u2, t2;
    return this.getChildContext || (u2 = /* @__PURE__ */ new Set(), (t2 = {})[l2.__c] = this, this.getChildContext = function() {
      return t2;
    }, this.componentWillUnmount = function() {
      u2 = null;
    }, this.shouldComponentUpdate = function(n4) {
      this.props.value != n4.value && u2.forEach(function(n5) {
        n5.__e = true, A$2(n5);
      });
    }, this.sub = function(n4) {
      u2.add(n4);
      var l3 = n4.componentWillUnmount;
      n4.componentWillUnmount = function() {
        u2 && u2.delete(n4), l3 && l3.call(n4);
      };
    }), n3.children;
  }
  return l2.__c = "__cC" + y$2++, l2.__ = n2, l2.Provider = l2.__l = (l2.Consumer = function(n3, l3) {
    return n3.children(l3);
  }).contextType = l2, l2;
}
n$1 = w$2.slice, l$3 = {
  __e: function(n2, l2, u2, t2) {
    for (var i2, r2, o2; l2 = l2.__; ) if ((i2 = l2.__c) && !i2.__) try {
      if ((r2 = i2.constructor) && null != r2.getDerivedStateFromError && (i2.setState(r2.getDerivedStateFromError(n2)), o2 = i2.__d), null != i2.componentDidCatch && (i2.componentDidCatch(n2, t2 || {}), o2 = i2.__d), o2) return i2.__E = i2;
    } catch (l3) {
      n2 = l3;
    }
    throw n2;
  }
}, u$3 = 0, t$2 = function(n2) {
  return null != n2 && void 0 === n2.constructor;
}, C$2.prototype.setState = function(n2, l2) {
  var u2;
  u2 = null != this.__s && this.__s != this.state ? this.__s : this.__s = m$2({}, this.state), "function" == typeof n2 && (n2 = n2(m$2({}, u2), this.props)), n2 && m$2(u2, n2), null != n2 && this.__v && (l2 && this._sb.push(l2), A$2(this));
}, C$2.prototype.forceUpdate = function(n2) {
  this.__v && (this.__e = true, n2 && this.__h.push(n2), A$2(this));
}, C$2.prototype.render = S, i$3 = [], o$3 = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, e$1 = function(n2, l2) {
  return n2.__v.__b - l2.__v.__b;
}, H$1.__r = 0, f$3 = Math.random().toString(8), c$3 = "__d" + f$3, a$3 = "__a" + f$3, s$3 = /(PointerCapture)$|Capture$/i, h$2 = 0, p$3 = V$1(false), v$2 = V$1(true), y$2 = 0;
var t$1 = /["&<]/;
function n(r2) {
  if (0 === r2.length || false === t$1.test(r2)) return r2;
  for (var e2 = 0, n2 = 0, o2 = "", f2 = ""; n2 < r2.length; n2++) {
    switch (r2.charCodeAt(n2)) {
      case 34:
        f2 = "&quot;";
        break;
      case 38:
        f2 = "&amp;";
        break;
      case 60:
        f2 = "&lt;";
        break;
      default:
        continue;
    }
    n2 !== e2 && (o2 += r2.slice(e2, n2)), o2 += f2, e2 = n2 + 1;
  }
  return n2 !== e2 && (o2 += r2.slice(e2, n2)), o2;
}
var o$2 = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i, f$2 = 0, i$2 = Array.isArray;
function u$2(e2, t2, n2, o2, i2, u2) {
  t2 || (t2 = {});
  var a2, c2, p2 = t2;
  if ("ref" in p2) for (c2 in p2 = {}, t2) "ref" == c2 ? a2 = t2[c2] : p2[c2] = t2[c2];
  var l2 = {
    type: e2,
    props: p2,
    key: n2,
    ref: a2,
    __k: null,
    __: null,
    __b: 0,
    __e: null,
    __c: null,
    constructor: void 0,
    __v: --f$2,
    __i: -1,
    __u: 0,
    __source: i2,
    __self: u2
  };
  if ("function" == typeof e2 && (a2 = e2.defaultProps)) for (c2 in a2) void 0 === p2[c2] && (p2[c2] = a2[c2]);
  return l$3.vnode && l$3.vnode(l2), l2;
}
function a$2(r2) {
  var t2 = u$2(S, {
    tpl: r2,
    exprs: [].slice.call(arguments, 1)
  });
  return t2.key = t2.__v, t2;
}
var c$2 = {}, p$2 = /[A-Z]/g;
function l$2(e2, t2) {
  if (l$3.attr) {
    var f2 = l$3.attr(e2, t2);
    if ("string" == typeof f2) return f2;
  }
  if (t2 = (function(r2) {
    return null !== r2 && "object" == typeof r2 && "function" == typeof r2.valueOf ? r2.valueOf() : r2;
  })(t2), "ref" === e2 || "key" === e2) return "";
  if ("style" === e2 && "object" == typeof t2) {
    var i2 = "";
    for (var u2 in t2) {
      var a2 = t2[u2];
      if (null != a2 && "" !== a2) {
        var l2 = "-" == u2[0] ? u2 : c$2[u2] || (c$2[u2] = u2.replace(p$2, "-$&").toLowerCase()), s2 = ";";
        "number" != typeof a2 || l2.startsWith("--") || o$2.test(l2) || (s2 = "px;"), i2 = i2 + l2 + ":" + a2 + s2;
      }
    }
    return e2 + '="' + n(i2) + '"';
  }
  return null == t2 || false === t2 || "function" == typeof t2 || "object" == typeof t2 ? "" : true === t2 ? e2 : e2 + '="' + n("" + t2) + '"';
}
function s$2(r2) {
  if (null == r2 || "boolean" == typeof r2 || "function" == typeof r2) return null;
  if ("object" == typeof r2) {
    if (void 0 === r2.constructor) return r2;
    if (i$2(r2)) {
      for (var e2 = 0; e2 < r2.length; e2++) r2[e2] = s$2(r2[e2]);
      return r2;
    }
  }
  return n("" + r2);
}
class HttpError extends Error {
  /**
   * The HTTP status code.
   *
   * @example Basic usage
   * ```ts
   * import { App, HttpError } from "fresh";
   * import { expect } from "@std/expect";
   *
   * const app = new App()
   *   .get("/", () => new Response("ok"))
   *   .get("/not-found", () => {
   *      throw new HttpError(404, "Nothing here");
   *    });
   *
   * const handler = app.handler();
   *
   * try {
   *   await handler(new Request("http://localhost/not-found"))
   * } catch (error) {
   *   expect(error).toBeInstanceOf(HttpError);
   *   expect(error.status).toBe(404);
   *   expect(error.message).toBe("Nothing here");
   * }
   * ```
   */
  status;
  /**
   * Constructs a new instance.
   *
   * @param status The HTTP status code.
   * @param message The error message. Defaults to the status text of the given
   * status code.
   * @param options Optional error options.
   */
  constructor(status, message, options2) {
    super(message, options2);
    this.name = this.constructor.name;
    this.status = status;
  }
}
const INTERNAL_PREFIX = "/_frsh";
const DEV_ERROR_OVERLAY_URL = `${INTERNAL_PREFIX}/error_overlay`;
const PARTIAL_SEARCH_PARAM = "fresh-partial";
const ASSET_CACHE_BUST_KEY = "__frsh_c";
const DATA_CURRENT = "data-current";
const DATA_ANCESTOR = "data-ancestor";
const DATA_FRESH_KEY = "data-frsh-key";
const CLIENT_NAV_ATTR = "f-client-nav";
var OptionsType = /* @__PURE__ */ (function(OptionsType2) {
  OptionsType2["ATTR"] = "attr";
  OptionsType2["VNODE"] = "vnode";
  OptionsType2["HOOK"] = "__h";
  OptionsType2["DIFF"] = "__b";
  OptionsType2["RENDER"] = "__r";
  OptionsType2["DIFFED"] = "diffed";
  OptionsType2["ERROR"] = "__e";
  return OptionsType2;
})({});
function matchesUrl(current, needle, currentSearch) {
  const needleUrl = new URL(needle, "http://localhost");
  let href = needleUrl.pathname;
  const needleSearch = needleUrl.search;
  if (href !== "/" && href.endsWith("/")) {
    href = href.slice(0, -1);
  }
  if (current !== "/" && current.endsWith("/")) {
    current = current.slice(0, -1);
  }
  if (current === href) {
    if (needleSearch && currentSearch !== void 0 && needleSearch !== currentSearch) {
      return 1;
    }
    return 2;
  } else if (current.startsWith(href + "/") || href === "/") {
    return 1;
  }
  return 0;
}
function setActiveUrl(vnode, pathname, search) {
  const props = vnode.props;
  const hrefProp = props.href;
  if (typeof hrefProp === "string" && hrefProp.startsWith("/")) {
    if (props["aria-current"] !== void 0) return;
    const match = matchesUrl(pathname, hrefProp, search);
    if (match === 2) {
      props[DATA_CURRENT] = "true";
      props["aria-current"] = "page";
    } else if (match === 1) {
      props[DATA_ANCESTOR] = "true";
      props["aria-current"] = "true";
    }
  }
}
var PartialMode = /* @__PURE__ */ (function(PartialMode2) {
  PartialMode2[PartialMode2["Replace"] = 0] = "Replace";
  PartialMode2[PartialMode2["Append"] = 1] = "Append";
  PartialMode2[PartialMode2["Prepend"] = 2] = "Prepend";
  return PartialMode2;
})({});
function assetInternal(path, buildId) {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  try {
    const url = new URL(path, "https://freshassetcache.local");
    if (url.protocol !== "https:" || url.host !== "freshassetcache.local" || url.searchParams.has(ASSET_CACHE_BUST_KEY)) {
      return path;
    }
    url.searchParams.set(ASSET_CACHE_BUST_KEY, buildId);
    return url.pathname + url.search + url.hash;
  } catch (err) {
    console.warn(`Failed to create asset() URL, falling back to regular path ('${path}'):`, err);
    return path;
  }
}
function assetSrcSetInternal(srcset, buildId) {
  if (srcset.includes("(")) return srcset;
  const parts = srcset.split(",");
  const constructed = [];
  for (const part of parts) {
    const trimmed = part.trimStart();
    const leadingWhitespace = part.length - trimmed.length;
    if (trimmed === "") return srcset;
    let urlEnd = trimmed.indexOf(" ");
    if (urlEnd === -1) urlEnd = trimmed.length;
    const leading = part.substring(0, leadingWhitespace);
    const url = trimmed.substring(0, urlEnd);
    const trailing = trimmed.substring(urlEnd);
    constructed.push(leading + assetInternal(url, buildId) + trailing);
  }
  return constructed.join(",");
}
function assetHashingHook(vnode, buildId) {
  if (vnode.type === "img" || vnode.type === "source") {
    const {
      props
    } = vnode;
    if (props["data-fresh-disable-lock"]) return;
    if (typeof props.src === "string") {
      props.src = assetInternal(props.src, buildId);
    }
    if (typeof props.srcset === "string") {
      props.srcset = assetSrcSetInternal(props.srcset, buildId);
    }
  }
}
const HeadContext = X(false);
function asset(path) {
  return assetInternal(path, BUILD_ID);
}
function Partial(props) {
  return props.children;
}
Partial.displayName = "Partial";
const UNDEFINED = -1;
const NULL = -2;
const NAN = -3;
const INFINITY_POS = -4;
const INFINITY_NEG = -5;
const ZERO_NEG = -6;
const HOLE = -7;
function stringify$1(data, custom) {
  const out = [];
  const indexes = /* @__PURE__ */ new Map();
  const res = serializeInner(out, indexes, data, custom);
  if (res < 0) {
    return String(res);
  }
  return `[${out.join(",")}]`;
}
function serializeInner(out, indexes, value, custom) {
  const seenIdx = indexes.get(value);
  if (seenIdx !== void 0) return seenIdx;
  if (value === void 0) return UNDEFINED;
  if (value === null) return NULL;
  if (Number.isNaN(value)) return NAN;
  if (value === Infinity) return INFINITY_POS;
  if (value === -Infinity) return INFINITY_NEG;
  if (value === 0 && 1 / value < 0) return ZERO_NEG;
  const idx = out.length;
  out.push("");
  indexes.set(value, idx);
  let str = "";
  if (typeof value === "number") {
    str += String(value);
  } else if (typeof value === "boolean") {
    str += String(value);
  } else if (typeof value === "bigint") {
    str += `["BigInt","${value}"]`;
  } else if (typeof value === "string") {
    str += JSON.stringify(value);
  } else if (Array.isArray(value)) {
    str += "[";
    for (let i2 = 0; i2 < value.length; i2++) {
      if (i2 in value) {
        str += serializeInner(out, indexes, value[i2], custom);
      } else {
        str += HOLE;
      }
      if (i2 < value.length - 1) {
        str += ",";
      }
    }
    str += "]";
  } else if (typeof value === "object") {
    if (custom !== void 0) {
      for (const k2 in custom) {
        const fn = custom[k2];
        if (fn === void 0) continue;
        const res = fn(value);
        if (res === void 0) continue;
        const innerIdx = serializeInner(out, indexes, res.value, custom);
        str = `["${k2}",${innerIdx}]`;
        out[idx] = str;
        return idx;
      }
    }
    if (value instanceof URL) {
      str += `["URL","${value.href}"]`;
    } else if (value instanceof Date) {
      let iso;
      try {
        iso = value.toISOString();
      } catch {
        iso = "Invalid Date";
      }
      str += `["Date","${iso}"]`;
    } else if (value instanceof RegExp) {
      str += `["RegExp",${JSON.stringify(value.source)}, "${value.flags}"]`;
    } else if (value instanceof Uint8Array) {
      str += `["Uint8Array","${b64encode(value.buffer)}"]`;
    } else if (value instanceof Set) {
      const items = new Array(value.size);
      let i2 = 0;
      value.forEach((v2) => {
        items[i2++] = serializeInner(out, indexes, v2, custom);
      });
      str += `["Set",[${items.join(",")}]]`;
    } else if (value instanceof Map) {
      const items = new Array(value.size * 2);
      let i2 = 0;
      value.forEach((v2, k2) => {
        items[i2++] = serializeInner(out, indexes, k2, custom);
        items[i2++] = serializeInner(out, indexes, v2, custom);
      });
      str += `["Map",[${items.join(",")}]]`;
    } else if (typeof Temporal !== "undefined" && value instanceof Temporal.Instant) {
      str += `["Temporal.Instant","${value.toString()}"]`;
    } else if (typeof Temporal !== "undefined" && value instanceof Temporal.ZonedDateTime) {
      str += `["Temporal.ZonedDateTime","${value.toString()}"]`;
    } else if (typeof Temporal !== "undefined" && value instanceof Temporal.PlainDate) {
      str += `["Temporal.PlainDate","${value.toString()}"]`;
    } else if (typeof Temporal !== "undefined" && value instanceof Temporal.PlainTime) {
      str += `["Temporal.PlainTime","${value.toString()}"]`;
    } else if (typeof Temporal !== "undefined" && value instanceof Temporal.PlainDateTime) {
      str += `["Temporal.PlainDateTime","${value.toString()}"]`;
    } else if (typeof Temporal !== "undefined" && value instanceof Temporal.PlainYearMonth) {
      str += `["Temporal.PlainYearMonth","${value.toString()}"]`;
    } else if (typeof Temporal !== "undefined" && value instanceof Temporal.PlainMonthDay) {
      str += `["Temporal.PlainMonthDay","${value.toString()}"]`;
    } else if (typeof Temporal !== "undefined" && value instanceof Temporal.Duration) {
      str += `["Temporal.Duration","${value.toString()}"]`;
    } else {
      str += "{";
      const keys = Object.keys(value);
      for (let i2 = 0; i2 < keys.length; i2++) {
        const key = keys[i2];
        str += JSON.stringify(key) + ":";
        str += serializeInner(out, indexes, value[key], custom);
        if (i2 < keys.length - 1) {
          str += ",";
        }
      }
      str += "}";
    }
  } else if (typeof value === "function") {
    throw new Error(`Serializing functions is not supported.`);
  }
  out[idx] = str;
  return idx;
}
const base64abc$1 = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "+", "/"];
function b64encode(buffer) {
  const uint8 = new Uint8Array(buffer);
  let result = "", i2;
  const l2 = uint8.length;
  for (i2 = 2; i2 < l2; i2 += 3) {
    result += base64abc$1[uint8[i2 - 2] >> 2];
    result += base64abc$1[(uint8[i2 - 2] & 3) << 4 | uint8[i2 - 1] >> 4];
    result += base64abc$1[(uint8[i2 - 1] & 15) << 2 | uint8[i2] >> 6];
    result += base64abc$1[uint8[i2] & 63];
  }
  if (i2 === l2 + 1) {
    result += base64abc$1[uint8[i2 - 2] >> 2];
    result += base64abc$1[(uint8[i2 - 2] & 3) << 4];
    result += "==";
  }
  if (i2 === l2) {
    result += base64abc$1[uint8[i2 - 2] >> 2];
    result += base64abc$1[(uint8[i2 - 2] & 3) << 4 | uint8[i2 - 1] >> 4];
    result += base64abc$1[(uint8[i2 - 1] & 15) << 2];
    result += "=";
  }
  return result;
}
const rawToEntityEntries = [["&", "&amp;"], ["<", "&lt;"], [">", "&gt;"], ['"', "&quot;"], ["'", "&#39;"]];
Object.fromEntries([...rawToEntityEntries.map(([raw, entity]) => [entity, raw]), ["&apos;", "'"], ["&nbsp;", " "]]);
const rawToEntity = new Map(rawToEntityEntries);
const rawRe = new RegExp(`[${[...rawToEntity.keys()].join("")}]`, "g");
function escape(str) {
  return str.replaceAll(rawRe, (m2) => rawToEntity.get(m2));
}
function tabs2Spaces(str) {
  return str.replace(/^\t+/, (tabs) => "  ".repeat(tabs.length));
}
function createCodeFrame(text, lineNum, columnNum) {
  const before = 2;
  const after = 3;
  const lines = text.split("\n");
  if (lines.length <= lineNum || lines[lineNum].length < columnNum) {
    return;
  }
  const start = Math.max(0, lineNum - before);
  const end = Math.min(lines.length, lineNum + after + 1);
  const maxLineNum = String(end).length;
  const padding = " ".repeat(maxLineNum);
  const spaceLines = [];
  let maxLineLen = 0;
  for (let i2 = start; i2 < end; i2++) {
    const line = tabs2Spaces(lines[i2]);
    spaceLines.push(line);
    if (line.length > maxLineLen) maxLineLen = line.length;
  }
  const activeLine = spaceLines[lineNum - start];
  const count = Math.max(0, activeLine.length - lines[lineNum].length + columnNum);
  const sep = "|";
  let out = "";
  for (let i2 = 0; i2 < spaceLines.length; i2++) {
    const line = spaceLines[i2];
    const currentLine = (padding + (i2 + start + 1)).slice(-maxLineNum);
    if (i2 === lineNum - start) {
      out += `> ${currentLine} ${sep} ${line}
`;
      const columnMarker = "^";
      out += `  ${padding} ${sep} ${" ".repeat(count)}${columnMarker}
`;
    } else {
      out += `  ${currentLine} ${sep} ${line}
`;
    }
  }
  return out;
}
const STACK_FRAME = /^\s*at\s+(?:(.*)\s+)?\((.*):(\d+):(\d+)\)$/;
function getFirstUserFile(stack, rootDir) {
  const lines = stack.split("\n");
  for (let i2 = 0; i2 < lines.length; i2++) {
    const match = lines[i2].match(STACK_FRAME);
    if (match) {
      const fnName = match[1] ?? "";
      const file = match[2];
      const line = +match[3];
      const column = +match[4];
      if (file.startsWith("file://")) {
        const filePath = fromFileUrl(file);
        if (relative$3(rootDir, filePath).startsWith(".")) {
          continue;
        }
        return {
          fnName,
          file,
          line,
          column
        };
      }
    }
  }
}
function getCodeFrame(stack, rootDir) {
  const file = getFirstUserFile(stack, rootDir);
  if (file) {
    try {
      const filePath = fromFileUrl(file.file);
      const text = Deno.readTextFileSync(filePath);
      return createCodeFrame(text, file.line - 1, file.column - 1);
    } catch {
    }
  }
}
const SCRIPT_ESCAPE = /<\/(style|script)/gi;
const COMMENT_ESCAPE = /<!--/gi;
function escapeScript(content, options2 = {}) {
  return content.replaceAll(SCRIPT_ESCAPE, "<\\/$1").replaceAll(COMMENT_ESCAPE, options2.json ? "\\u003C!--" : "\\x3C!--");
}
class UniqueNamer {
  #seen = /* @__PURE__ */ new Map();
  getUniqueName(name) {
    name = name.replaceAll(/([^A-Za-z0-9_$]+)/g, "_");
    if (/^\d/.test(name) || JS_RESERVED.has(name)) {
      name = "_" + name;
    }
    const count = this.#seen.get(name);
    if (count === void 0) {
      this.#seen.set(name, 1);
    } else {
      this.#seen.set(name, count + 1);
      name = `${name}_${count}`;
    }
    return name;
  }
}
const JS_RESERVED = /* @__PURE__ */ new Set([
  // Reserved keywords
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "else",
  "export",
  "extends",
  "false",
  "finally",
  "for",
  "function",
  "if",
  "import",
  "in",
  "instanceof",
  "new",
  "null",
  "return",
  "super",
  "switch",
  "this",
  "throw",
  "true",
  "try",
  "typeof",
  "var",
  "void",
  "while",
  "with",
  "let",
  "static",
  "yield",
  "await",
  "enum",
  "implements",
  "interface",
  "package",
  "private",
  "protected",
  "public",
  "abstract",
  "boolean",
  "byte",
  "char",
  "double",
  "final",
  "float",
  "goto",
  "int",
  "long",
  "native",
  "short",
  "synchronized",
  "throws",
  "transient",
  "volatile",
  "arguments",
  "as",
  "async",
  "eval",
  "from",
  "get",
  "of",
  "set",
  // JavaScript built-in objects that could cause shadowing bugs
  "Array",
  "ArrayBuffer",
  "Boolean",
  "DataView",
  "Date",
  "Error",
  "EvalError",
  "Float32Array",
  "Float64Array",
  "Function",
  "Infinity",
  "Int8Array",
  "Int16Array",
  "Int32Array",
  "Intl",
  "JSON",
  "Map",
  "Math",
  "NaN",
  "Number",
  "Object",
  "Promise",
  "Proxy",
  "RangeError",
  "ReferenceError",
  "Reflect",
  "RegExp",
  "Set",
  "String",
  "Symbol",
  "SyntaxError",
  "TypeError",
  "Uint8Array",
  "Uint8ClampedArray",
  "Uint16Array",
  "Uint32Array",
  "URIError",
  "WeakMap",
  "WeakSet",
  "BigInt",
  "BigInt64Array",
  "BigUint64Array",
  // Web APIs commonly used in islands
  "console",
  "fetch",
  "Request",
  "Response",
  "Headers",
  "URL",
  "URLSearchParams",
  "Event",
  "EventTarget",
  "AbortController",
  "AbortSignal",
  "FormData",
  "Blob",
  "File",
  "FileReader",
  "TextEncoder",
  "TextDecoder",
  "ReadableStream",
  "WritableStream",
  "TransformStream",
  "WebSocket",
  "Worker",
  "MessageChannel",
  "MessagePort",
  "BroadcastChannel",
  "crypto",
  "atob",
  "btoa",
  "setTimeout",
  "setInterval",
  "clearTimeout",
  "clearInterval",
  "queueMicrotask",
  "structuredClone",
  // Browser-specific globals
  "document",
  "window",
  "navigator",
  "location",
  "history",
  "localStorage",
  "sessionStorage",
  // Deno-specific globals
  "Deno",
  // Node.js compatibility globals (for Deno's Node compat mode)
  "process",
  "global",
  "Buffer"
]);
function isLazy(value) {
  return typeof value === "function";
}
var t, r$1, u$1, i$1, o$1 = 0, f$1 = [], c$1 = l$3, e = c$1.__b, a$1 = c$1.__r, v$1 = c$1.diffed, l$1 = c$1.__c, m$1 = c$1.unmount, p$1 = c$1.__;
function s$1(n2, t2) {
  c$1.__h && c$1.__h(r$1, n2, o$1 || t2), o$1 = 0;
  var u2 = r$1.__H || (r$1.__H = {
    __: [],
    __h: []
  });
  return n2 >= u2.__.length && u2.__.push({}), u2.__[n2];
}
function d$1(n2) {
  return o$1 = 1, y$1(D$1, n2);
}
function y$1(n2, u2, i2) {
  var o2 = s$1(t++, 2);
  if (o2.t = n2, !o2.__c && (o2.__ = [D$1(void 0, u2), function(n3) {
    var t2 = o2.__N ? o2.__N[0] : o2.__[0], r2 = o2.t(t2, n3);
    t2 !== r2 && (o2.__N = [r2, o2.__[1]], o2.__c.setState({}));
  }], o2.__c = r$1, !r$1.__f)) {
    var f2 = function(n3, t2, r2) {
      if (!o2.__c.__H) return true;
      var u3 = false, i3 = o2.__c.props !== n3;
      if (o2.__c.__H.__.some(function(n4) {
        if (n4.__N) {
          u3 = true;
          var t3 = n4.__[0];
          n4.__ = n4.__N, n4.__N = void 0, t3 !== n4.__[0] && (i3 = true);
        }
      }), c2) {
        var f3 = c2.call(this, n3, t2, r2);
        return u3 ? f3 || i3 : f3;
      }
      return !u3 || i3;
    };
    r$1.__f = true;
    var c2 = r$1.shouldComponentUpdate, e2 = r$1.componentWillUpdate;
    r$1.componentWillUpdate = function(n3, t2, r2) {
      if (this.__e) {
        var u3 = c2;
        c2 = void 0, f2(n3, t2, r2), c2 = u3;
      }
      e2 && e2.call(this, n3, t2, r2);
    }, r$1.shouldComponentUpdate = f2;
  }
  return o2.__N || o2.__;
}
function h$1(n2, u2) {
  var i2 = s$1(t++, 3);
  !c$1.__s && C$1(i2.__H, u2) && (i2.__ = n2, i2.u = u2, r$1.__H.__h.push(i2));
}
function A$1(n2) {
  return o$1 = 5, T(function() {
    return {
      current: n2
    };
  }, []);
}
function T(n2, r2) {
  var u2 = s$1(t++, 7);
  return C$1(u2.__H, r2) && (u2.__ = n2(), u2.__H = r2, u2.__h = n2), u2.__;
}
function q$1(n2, t2) {
  return o$1 = 8, T(function() {
    return n2;
  }, t2);
}
function x$1(n2) {
  var u2 = r$1.context[n2.__c], i2 = s$1(t++, 9);
  return i2.c = n2, u2 ? (null == i2.__ && (i2.__ = true, u2.sub(r$1)), u2.props.value) : n2.__;
}
function g$1() {
  var n2 = s$1(t++, 11);
  if (!n2.__) {
    for (var u2 = r$1.__v; null !== u2 && !u2.__m && null !== u2.__; ) u2 = u2.__;
    var i2 = u2.__m || (u2.__m = [0, 0]);
    n2.__ = "P" + i2[0] + "-" + i2[1]++;
  }
  return n2.__;
}
function j() {
  for (var n2; n2 = f$1.shift(); ) {
    var t2 = n2.__H;
    if (n2.__P && t2) try {
      t2.__h.some(z$1), t2.__h.some(B$1), t2.__h = [];
    } catch (r2) {
      t2.__h = [], c$1.__e(r2, n2.__v);
    }
  }
}
c$1.__b = function(n2) {
  r$1 = null, e && e(n2);
}, c$1.__ = function(n2, t2) {
  n2 && t2.__k && t2.__k.__m && (n2.__m = t2.__k.__m), p$1 && p$1(n2, t2);
}, c$1.__r = function(n2) {
  a$1 && a$1(n2), t = 0;
  var i2 = (r$1 = n2.__c).__H;
  i2 && (u$1 === r$1 ? (i2.__h = [], r$1.__h = [], i2.__.some(function(n3) {
    n3.__N && (n3.__ = n3.__N), n3.u = n3.__N = void 0;
  })) : (i2.__h.some(z$1), i2.__h.some(B$1), i2.__h = [], t = 0)), u$1 = r$1;
}, c$1.diffed = function(n2) {
  v$1 && v$1(n2);
  var t2 = n2.__c;
  t2 && t2.__H && (t2.__H.__h.length && (1 !== f$1.push(t2) && i$1 === c$1.requestAnimationFrame || ((i$1 = c$1.requestAnimationFrame) || w$1)(j)), t2.__H.__.some(function(n3) {
    n3.u && (n3.__H = n3.u, n3.u = void 0);
  })), u$1 = r$1 = null;
}, c$1.__c = function(n2, t2) {
  t2.some(function(n3) {
    try {
      n3.__h.some(z$1), n3.__h = n3.__h.filter(function(n4) {
        return !n4.__ || B$1(n4);
      });
    } catch (r2) {
      t2.some(function(n4) {
        n4.__h && (n4.__h = []);
      }), t2 = [], c$1.__e(r2, n3.__v);
    }
  }), l$1 && l$1(n2, t2);
}, c$1.unmount = function(n2) {
  m$1 && m$1(n2);
  var t2, r2 = n2.__c;
  r2 && r2.__H && (r2.__H.__.some(function(n3) {
    try {
      z$1(n3);
    } catch (n4) {
      t2 = n4;
    }
  }), r2.__H = void 0, t2 && c$1.__e(t2, r2.__v));
};
var k$1 = "function" == typeof requestAnimationFrame;
function w$1(n2) {
  var t2, r2 = function() {
    clearTimeout(u2), k$1 && cancelAnimationFrame(t2), setTimeout(n2);
  }, u2 = setTimeout(r2, 35);
  k$1 && (t2 = requestAnimationFrame(r2));
}
function z$1(n2) {
  var t2 = r$1, u2 = n2.__c;
  "function" == typeof u2 && (n2.__c = void 0, u2()), r$1 = t2;
}
function B$1(n2) {
  var t2 = r$1;
  n2.__c = n2.__(), r$1 = t2;
}
function C$1(n2, t2) {
  return !n2 || n2.length !== t2.length || t2.some(function(t3, r2) {
    return t3 !== n2[r2];
  });
}
function D$1(n2, t2) {
  return "function" == typeof t2 ? t2(n2) : t2;
}
const options = l$3;
class RenderState {
  ctx;
  buildCache;
  partialId;
  nonce;
  partialDepth;
  partialCount;
  error;
  // deno-lint-ignore no-explicit-any
  slots;
  // deno-lint-ignore no-explicit-any
  islandProps;
  islands;
  islandAssets;
  /** CSS assets already injected in `<head>` via `RemainingHead`. */
  injectedCss;
  // deno-lint-ignore no-explicit-any
  encounteredPartials;
  owners;
  ownerStack;
  headComponents;
  // TODO: merge into bitmask field
  renderedHtmlTag;
  renderedHtmlBody;
  renderedHtmlHead;
  hasRuntimeScript;
  /** Set to true when any element in the tree renders f-client-nav="true". */
  clientNavEnabled;
  /**
   * True when the page needs Fresh's client runtime (islands, client nav, or
   * `<Partial>` regions on a full document). Partial subresponses omit boot;
   * `encounteredPartials` must not force runtime for those requests.
   */
  get needsClientRuntime() {
    if (this.islands.size > 0 || this.clientNavEnabled) {
      return true;
    }
    if (!this.ctx.url.searchParams.has(PARTIAL_SEARCH_PARAM) && this.encounteredPartials.size > 0) {
      return true;
    }
    return false;
  }
  constructor(ctx, buildCache, partialId) {
    this.ctx = ctx;
    this.buildCache = buildCache;
    this.partialId = partialId;
    this.partialDepth = 0;
    this.partialCount = 0;
    this.error = null;
    this.slots = [];
    this.islandProps = [];
    this.islands = /* @__PURE__ */ new Set();
    this.islandAssets = /* @__PURE__ */ new Set();
    this.injectedCss = /* @__PURE__ */ new Set();
    this.encounteredPartials = /* @__PURE__ */ new Set();
    this.owners = /* @__PURE__ */ new Map();
    this.ownerStack = [];
    this.headComponents = /* @__PURE__ */ new Map();
    this.renderedHtmlTag = false;
    this.renderedHtmlBody = false;
    this.renderedHtmlHead = false;
    this.hasRuntimeScript = false;
    this.clientNavEnabled = false;
    this.nonce = crypto.randomUUID().replace(/-/g, "");
  }
  clear() {
    this.islands.clear();
    this.encounteredPartials.clear();
    this.owners.clear();
    this.injectedCss.clear();
    this.slots = [];
    this.islandProps = [];
    this.ownerStack = [];
  }
}
let RENDER_STATE = null;
function setRenderState(state) {
  RENDER_STATE = state;
}
const oldVNodeHook = options[OptionsType.VNODE];
options[OptionsType.VNODE] = (vnode) => {
  if (RENDER_STATE !== null) {
    RENDER_STATE.owners.set(vnode, RENDER_STATE.ownerStack.at(-1));
    if (vnode.type === "a") {
      setActiveUrl(vnode, RENDER_STATE.ctx.url.pathname, RENDER_STATE.ctx.url.search);
    }
  }
  assetHashingHook(vnode, BUILD_ID);
  if (typeof vnode.type === "function") {
    if (vnode.type === Partial) {
      const props = vnode.props;
      const key = normalizeKey(vnode.key);
      const mode = !props.mode || props.mode === "replace" ? PartialMode.Replace : props.mode === "append" ? PartialMode.Append : PartialMode.Prepend;
      props.children = wrapWithMarker(props.children, "partial", `${props.name}:${mode}:${key}`);
    }
  } else if (typeof vnode.type === "string") {
    if (RENDER_STATE !== null && (vnode.type === "script" || vnode.type === "style")) {
      const props = vnode.props;
      if (!props.nonce) {
        props.nonce = RENDER_STATE.nonce;
      }
    }
    if (vnode.type === "body") {
      const scripts = k$2(FreshScripts, null);
      if (vnode.props.children == null) {
        vnode.props.children = scripts;
      } else if (Array.isArray(vnode.props.children)) {
        vnode.props.children.push(scripts);
      } else {
        vnode.props.children = [vnode.props.children, scripts];
      }
    }
    if (CLIENT_NAV_ATTR in vnode.props) {
      vnode.props[CLIENT_NAV_ATTR] = String(vnode.props[CLIENT_NAV_ATTR]);
    }
  }
  oldVNodeHook?.(vnode);
};
const oldAttrHook = options[OptionsType.ATTR];
options[OptionsType.ATTR] = (name, value) => {
  if (name === CLIENT_NAV_ATTR) {
    return `${CLIENT_NAV_ATTR}="${String(Boolean(value))}"`;
  } else if (name === "key") {
    return `${DATA_FRESH_KEY}="${escape(String(value))}"`;
  }
  return oldAttrHook?.(name, value);
};
const PATCHED = /* @__PURE__ */ new WeakSet();
function normalizeKey(key) {
  const value = key ?? "";
  const s2 = typeof value !== "string" ? String(value) : value;
  return s2.replaceAll(":", "_");
}
const oldDiff = options[OptionsType.DIFF];
options[OptionsType.DIFF] = (vnode) => {
  if (RENDER_STATE !== null) {
    patcher: if (typeof vnode.type === "function" && vnode.type !== S) {
      if (vnode.type === Partial) {
        RENDER_STATE.partialDepth++;
        const name = vnode.props.name;
        if (typeof name === "string") {
          if (RENDER_STATE.encounteredPartials.has(name)) {
            throw new Error(`Rendered response contains duplicate partial name: "${name}"`);
          }
          RENDER_STATE.encounteredPartials.add(name);
        }
        if (hasIslandOwner(RENDER_STATE, vnode)) {
          throw new Error(`<Partial> components cannot be used inside islands.`);
        }
        const mode = vnode.props.mode;
        if ((mode === "append" || mode === "prepend") && vnode.key == null) {
          console.warn(`<Partial name="${name}" mode="${mode}"> is missing a "key" prop. Without a key, Preact cannot correctly reconcile ${mode}ed children. Add a unique key to fix this.`);
        }
      } else if (!PATCHED.has(vnode)) {
        const island = RENDER_STATE.buildCache.islandRegistry.get(vnode.type);
        const insideIsland = hasIslandOwner(RENDER_STATE, vnode);
        if (island === void 0) {
          if (insideIsland) break patcher;
          if (vnode.key !== void 0) {
            const key = normalizeKey(vnode.key);
            const originalType2 = vnode.type;
            vnode.type = (props) => {
              const child = k$2(originalType2, props);
              PATCHED.add(child);
              return wrapWithMarker(child, "key", key);
            };
          }
          break patcher;
        }
        const {
          islands: islands2,
          islandProps,
          islandAssets
        } = RENDER_STATE;
        if (insideIsland) {
          for (let i2 = 0; i2 < island.css.length; i2++) {
            const css2 = island.css[i2];
            islandAssets.add(css2);
          }
          break patcher;
        }
        islands2.add(island);
        const originalType = vnode.type;
        vnode.type = (props) => {
          for (const name in props) {
            const value = props[name];
            if (name === "children" || t$2(value) && !isSignal(value)) {
              const slotId = RENDER_STATE.slots.length;
              RENDER_STATE.slots.push({
                id: slotId,
                name,
                vnode: value
              });
              props[name] = k$2(Slot, {
                name,
                id: slotId
              }, value);
            }
          }
          const propsIdx = islandProps.push({
            slots: [],
            props
          }) - 1;
          const child = k$2(originalType, props);
          PATCHED.add(child);
          const key = normalizeKey(vnode.key);
          return wrapWithMarker(child, "island", `${island.name}:${propsIdx}:${key}`);
        };
      }
    } else if (typeof vnode.type === "string") {
      switch (vnode.type) {
        case "html":
          RENDER_STATE.renderedHtmlTag = true;
          break;
        case "head": {
          RENDER_STATE.renderedHtmlHead = true;
          const entryAssets2 = RENDER_STATE.buildCache.getEntryAssets();
          const items = [];
          if (entryAssets2.length > 0) {
            for (let i2 = 0; i2 < entryAssets2.length; i2++) {
              const id = entryAssets2[i2];
              if (id.endsWith(".css")) {
                items.push(
                  // deno-lint-ignore no-explicit-any
                  k$2("link", {
                    rel: "stylesheet",
                    href: asset(id)
                  })
                );
              }
            }
          }
          const activeSpan = _trace.getActiveSpan();
          if (activeSpan) {
            const spanCtx = activeSpan.spanContext();
            if (_isSpanContextValid(spanCtx)) {
              const flags = spanCtx.traceFlags & 1 ? "01" : "00";
              const traceparent = `00-${spanCtx.traceId}-${spanCtx.spanId}-${flags}`;
              items.push(
                // deno-lint-ignore no-explicit-any
                k$2("meta", {
                  name: "traceparent",
                  content: traceparent
                })
              );
            }
          }
          items.push(k$2(RemainingHead, null));
          if (Array.isArray(vnode.props.children)) {
            vnode.props.children.push(...items);
          } else if (vnode.props.children !== null && typeof vnode.props.children === "object") {
            items.unshift(vnode.props.children);
            vnode.props.children = items;
          } else {
            vnode.props.children = items;
          }
          break;
        }
        case "body":
          RENDER_STATE.renderedHtmlBody = true;
          break;
        case "title":
        case "meta":
        case "link":
        case "script":
        case "style":
        case "base":
        case "noscript":
        case "template":
          {
            if (PATCHED.has(vnode)) {
              break;
            }
            const originalType = vnode.type;
            let cacheKey = vnode.key ?? (originalType === "title" ? "title" : null);
            if (cacheKey === null) {
              const props = vnode.props;
              const keys = Object.keys(vnode.props);
              keys.sort();
              cacheKey = `${originalType}`;
              for (let i2 = 0; i2 < keys.length; i2++) {
                const key = keys[i2];
                if (key === "children" || key === "nonce" || key === "ref") {
                  continue;
                } else if (key === "dangerouslySetInnerHTML") {
                  cacheKey += String(props[key].__html);
                  continue;
                } else if (originalType === "meta" && key === "content") {
                  continue;
                } else if (originalType === "link" && key === "href") {
                  continue;
                }
                cacheKey += `::${props[key]}`;
              }
            }
            const originalKey = vnode.key;
            vnode.type = (props) => {
              const value = x$1(HeadContext);
              if (originalKey) {
                props["data-key"] = originalKey;
              }
              const vnode2 = k$2(originalType, props);
              PATCHED.add(vnode2);
              if (RENDER_STATE !== null) {
                if (value) {
                  RENDER_STATE.headComponents.set(cacheKey, vnode2);
                  return null;
                } else if (value !== void 0) {
                  const cached = RENDER_STATE.headComponents.get(cacheKey);
                  if (cached !== void 0) {
                    RENDER_STATE.headComponents.delete(cacheKey);
                    return cached;
                  }
                }
              }
              return vnode2;
            };
          }
          break;
      }
      if (CLIENT_NAV_ATTR in vnode.props && vnode.props[CLIENT_NAV_ATTR] === "true") {
        RENDER_STATE.clientNavEnabled = true;
      }
      if (vnode.key !== void 0 && (RENDER_STATE.partialDepth > 0 || hasIslandOwner(RENDER_STATE, vnode))) {
        vnode.props[DATA_FRESH_KEY] = String(vnode.key);
      }
    }
  }
  oldDiff?.(vnode);
};
const oldRender = options[OptionsType.RENDER];
options[OptionsType.RENDER] = (vnode) => {
  if (typeof vnode.type === "function" && vnode.type !== S && RENDER_STATE !== null) {
    RENDER_STATE.ownerStack.push(vnode);
  }
  oldRender?.(vnode);
};
const oldDiffed = options[OptionsType.DIFFED];
options[OptionsType.DIFFED] = (vnode) => {
  if (typeof vnode.type === "function" && vnode.type !== S && RENDER_STATE !== null) {
    RENDER_STATE.ownerStack.pop();
    if (vnode.type === Partial) {
      RENDER_STATE.partialDepth--;
    }
  }
  oldDiffed?.(vnode);
};
function RemainingHead() {
  if (RENDER_STATE !== null) {
    const items = [];
    if (RENDER_STATE.headComponents.size > 0) {
      items.push(...RENDER_STATE.headComponents.values());
    }
    RENDER_STATE.islands.forEach((island) => {
      if (island.css.length > 0) {
        for (let i2 = 0; i2 < island.css.length; i2++) {
          const css2 = island.css[i2];
          if (!RENDER_STATE.injectedCss.has(css2)) {
            RENDER_STATE.injectedCss.add(css2);
            items.push(k$2("link", {
              rel: "stylesheet",
              href: css2
            }));
          }
        }
      }
    });
    RENDER_STATE.islandAssets.forEach((css2) => {
      if (!RENDER_STATE.injectedCss.has(css2)) {
        RENDER_STATE.injectedCss.add(css2);
        items.push(k$2("link", {
          rel: "stylesheet",
          href: css2
        }));
      }
    });
    if (items.length > 0) {
      return k$2(S, null, items);
    }
  }
  return null;
}
function Slot(props) {
  if (RENDER_STATE !== null) {
    RENDER_STATE.slots[props.id] = null;
  }
  return wrapWithMarker(props.children, "slot", `${props.id}:${props.name}`);
}
function hasIslandOwner(current, vnode) {
  let tmpVNode = vnode;
  let owner;
  while ((owner = current.owners.get(tmpVNode)) !== void 0) {
    if (current.buildCache.islandRegistry.has(owner.type)) {
      return true;
    }
    tmpVNode = owner;
  }
  return false;
}
function wrapWithMarker(vnode, kind, markerText) {
  return k$2(S, null, k$2(S, {
    // @ts-ignore unstable property is not typed
    UNSTABLE_comment: `frsh:${kind}:${markerText}`
  }), vnode, k$2(S, {
    // @ts-ignore unstable property is not typed
    UNSTABLE_comment: "/frsh:" + kind
  }));
}
function isSignal(x2) {
  return x2 !== null && typeof x2 === "object" && typeof x2.peek === "function" && "value" in x2;
}
function isComputedSignal(x2) {
  return isSignal(x2) && ("x" in x2 && typeof x2.x === "function" || "_fn" in x2 && typeof x2._fn === "function");
}
function isVNode(x2) {
  return x2 !== null && typeof x2 === "object" && "type" in x2 && "ref" in x2 && "__k" in x2 && t$2(x2);
}
const stringifiers = {
  Computed: (value) => {
    return isComputedSignal(value) ? {
      value: value.peek()
    } : void 0;
  },
  Signal: (value) => {
    return isSignal(value) ? {
      value: value.peek()
    } : void 0;
  },
  Slot: (value) => {
    if (isVNode(value) && value.type === Slot) {
      const props = value.props;
      return {
        value: {
          name: props.name,
          id: props.id
        }
      };
    }
  }
};
function FreshScripts() {
  if (RENDER_STATE === null) return null;
  if (RENDER_STATE.hasRuntimeScript) {
    return null;
  }
  RENDER_STATE.hasRuntimeScript = true;
  const {
    slots
  } = RENDER_STATE;
  const lateCssLinks = [];
  RENDER_STATE.islands.forEach((island) => {
    for (let i2 = 0; i2 < island.css.length; i2++) {
      const css2 = island.css[i2];
      if (!RENDER_STATE.injectedCss.has(css2)) {
        RENDER_STATE.injectedCss.add(css2);
        lateCssLinks.push(k$2("link", {
          rel: "stylesheet",
          href: css2
        }));
      }
    }
  });
  RENDER_STATE.islandAssets.forEach((css2) => {
    if (!RENDER_STATE.injectedCss.has(css2)) {
      RENDER_STATE.injectedCss.add(css2);
      lateCssLinks.push(k$2("link", {
        rel: "stylesheet",
        href: css2
      }));
    }
  });
  return k$2(S, null, ...lateCssLinks, slots.map((slot) => {
    if (slot === null) return null;
    return k$2("template", {
      key: slot.id,
      id: `frsh-${slot.id}-${slot.name}`
    }, slot.vnode);
  }), k$2(FreshRuntimeScript, null));
}
function FreshRuntimeScript() {
  const {
    islands: islands2,
    nonce,
    ctx,
    islandProps,
    partialId,
    buildCache
  } = RENDER_STATE;
  const basePath = ctx.config.basePath;
  const islandArr = Array.from(islands2);
  if (ctx.url.searchParams.has(PARTIAL_SEARCH_PARAM)) {
    const islands22 = islandArr.map((island) => {
      return {
        exportName: island.exportName,
        chunk: island.file,
        name: island.name
      };
    });
    const serializedProps = stringify$1(islandProps, stringifiers);
    const json = {
      islands: islands22,
      props: serializedProps
    };
    return k$2("script", {
      id: `__FRSH_STATE_${partialId}`,
      type: "application/json",
      dangerouslySetInnerHTML: {
        __html: escapeScript(JSON.stringify(json), {
          json: true
        })
      }
    });
  } else if (RENDER_STATE.needsClientRuntime || buildCache.hmrClientEntry !== void 0) {
    const islandImports = islandArr.map((island) => {
      const named = island.exportName === "default" ? island.name : island.exportName === island.name ? `{ ${island.exportName} }` : `{ ${island.exportName} as ${island.name} }`;
      const islandSpec = island.file.startsWith(".") ? island.file.slice(1) : island.file;
      return `import ${named} from "${basePath}${islandSpec}";`;
    }).join("");
    const islandObj = "{" + islandArr.map((island) => island.name).join(",") + "}";
    const serializedProps = escapeScript(JSON.stringify(stringify$1(islandProps, stringifiers)), {
      json: true
    });
    const runtimeUrl = buildCache.clientEntry.startsWith(".") ? buildCache.clientEntry.slice(1) : buildCache.clientEntry;
    const scriptContent = `import { boot } from "${basePath}${runtimeUrl}";${islandImports}boot(${islandObj},${serializedProps});`;
    return k$2(S, null, k$2("script", {
      type: "module",
      nonce,
      dangerouslySetInnerHTML: {
        __html: scriptContent
      }
    }), buildCache.features.errorOverlay ? k$2(ShowErrorOverlay, null) : null);
  }
  return buildCache.features.errorOverlay ? k$2(ShowErrorOverlay, null) : null;
}
function ShowErrorOverlay() {
  if (RENDER_STATE === null) return null;
  const {
    ctx
  } = RENDER_STATE;
  const error = ctx.error;
  if (error === null || error === void 0) return null;
  if (error instanceof HttpError && error.status < 500) {
    return null;
  }
  const basePath = ctx.config.basePath;
  const searchParams = new URLSearchParams();
  if (typeof error === "object") {
    if ("message" in error) {
      searchParams.append("message", String(error.message));
    }
    if ("stack" in error && typeof error.stack === "string") {
      searchParams.append("stack", error.stack);
      const codeFrame = getCodeFrame(error.stack, ctx.config.root);
      if (codeFrame !== void 0) {
        searchParams.append("code-frame", codeFrame);
      }
    }
  } else {
    searchParams.append("message", String(error));
  }
  return k$2("iframe", {
    id: "fresh-error-overlay",
    src: `${basePath}${DEV_ERROR_OVERLAY_URL}?${searchParams.toString()}`,
    style: "unset: all; position: fixed; top: 0; left: 0; z-index: 99999; width: 100%; height: 100%; border: none;"
  });
}
const NONCE_SYMBOL = /* @__PURE__ */ Symbol.for("__freshNonce");
const version$2 = "2.3.3";
const denoJson = {
  version: version$2
};
const CURRENT_FRESH_VERSION = denoJson.version;
const tracer = _trace.getTracer("fresh", CURRENT_FRESH_VERSION);
function recordSpanError(span, err) {
  if (err instanceof Error) {
    span.recordException(err);
  } else {
    span.setStatus({
      code: _SpanStatusCode.ERROR,
      message: String(err)
    });
  }
}
function isAsyncAnyComponent(fn) {
  return typeof fn === "function" && fn.constructor.name === "AsyncFunction";
}
async function renderAsyncAnyComponent(fn, props) {
  return await tracer.startActiveSpan("invoke async component", async (span) => {
    span.setAttribute("fresh.span_type", "fs_routes/async_component");
    try {
      const result = await fn(props);
      span.setAttribute("fresh.component_response", result instanceof Response ? "http" : "jsx");
      return result;
    } catch (err) {
      recordSpanError(span, err);
      throw err;
    } finally {
      span.end();
    }
  });
}
async function renderRouteComponent(ctx, def, child) {
  const vnodeProps = {
    Component: child,
    config: ctx.config,
    data: def.props,
    error: ctx.error,
    info: ctx.info,
    isPartial: ctx.isPartial,
    params: ctx.params,
    req: ctx.req,
    state: ctx.state,
    url: ctx.url,
    route: ctx.route
  };
  if (isAsyncAnyComponent(def.component)) {
    const result = await renderAsyncAnyComponent(def.component, vnodeProps);
    if (result instanceof Response) {
      return result;
    }
    return result;
  }
  return k$2(def.component, vnodeProps);
}
var r = "diffed", o = "__c", i = "__s", a = "__c", c = "__k", u = "__d", s = "__s", l = /[\s\n\\/='"\0<>]/, f = /^(xlink|xmlns|xml)([A-Z])/, p = /^(?:accessK|auto[A-Z]|cell|ch|col|cont|cross|dateT|encT|form[A-Z]|frame|hrefL|inputM|maxL|minL|noV|playsI|popoverT|readO|rowS|src[A-Z]|tabI|useM|item[A-Z])/, h = /^ac|^ali|arabic|basel|cap|clipPath$|clipRule$|color|dominant|enable|fill|flood|font|glyph[^R]|horiz|image|letter|lighting|marker[^WUH]|overline|panose|pointe|paint|rendering|shape|stop|strikethrough|stroke|text[^L]|transform|underline|unicode|units|^v[^i]|^w|^xH/, d = /* @__PURE__ */ new Set(["draggable", "spellcheck"]);
function v(e2) {
  void 0 !== e2.__g ? e2.__g |= 8 : e2[u] = true;
}
function m(e2) {
  void 0 !== e2.__g ? e2.__g &= -9 : e2[u] = false;
}
function y(e2) {
  return void 0 !== e2.__g ? !!(8 & e2.__g) : true === e2[u];
}
var _ = /["&<]/;
function g(e2) {
  if (0 === e2.length || false === _.test(e2)) return e2;
  for (var t2 = 0, n2 = 0, r2 = "", o2 = ""; n2 < e2.length; n2++) {
    switch (e2.charCodeAt(n2)) {
      case 34:
        o2 = "&quot;";
        break;
      case 38:
        o2 = "&amp;";
        break;
      case 60:
        o2 = "&lt;";
        break;
      default:
        continue;
    }
    n2 !== t2 && (r2 += e2.slice(t2, n2)), r2 += o2, t2 = n2 + 1;
  }
  return n2 !== t2 && (r2 += e2.slice(t2, n2)), r2;
}
var b = {}, x = /* @__PURE__ */ new Set(["animation-iteration-count", "border-image-outset", "border-image-slice", "border-image-width", "box-flex", "box-flex-group", "box-ordinal-group", "column-count", "fill-opacity", "flex", "flex-grow", "flex-negative", "flex-order", "flex-positive", "flex-shrink", "flood-opacity", "font-weight", "grid-column", "grid-row", "line-clamp", "line-height", "opacity", "order", "orphans", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-miterlimit", "stroke-opacity", "stroke-width", "tab-size", "widows", "z-index", "zoom"]), k = /[A-Z]/g;
function w(e2) {
  var t2 = "";
  for (var n2 in e2) {
    var r2 = e2[n2];
    if (null != r2 && "" !== r2) {
      var o2 = "-" == n2[0] ? n2 : b[n2] || (b[n2] = n2.replace(k, "-$&").toLowerCase()), i2 = ";";
      "number" != typeof r2 || o2.startsWith("--") || x.has(o2) || (i2 = "px;"), t2 = t2 + o2 + ":" + r2 + i2;
    }
  }
  return t2 || void 0;
}
function C() {
  this.__d = true;
}
function A(e2, t2) {
  return {
    __v: e2,
    context: t2,
    props: e2.props,
    setState: C,
    forceUpdate: C,
    __d: true,
    __h: new Array(0)
  };
}
var D, P, $, U, F = {}, M = [], W = Array.isArray, z = Object.assign, H = "", N = "<!--$s-->", q = "<!--/$s-->";
function B(e2) {
  return "string" == typeof e2 ? N + e2 + q : W(e2) ? (e2.unshift(N), e2.push(q), e2) : e2 && "function" == typeof e2.then ? e2.then(B) : N + e2 + q;
}
function I(a2, u2, s2) {
  var l2 = l$3[i];
  l$3[i] = true, D = l$3.__b, P = l$3[r], $ = l$3.__r, U = l$3.unmount;
  var f2 = k$2(S, null);
  f2[c] = [a2];
  try {
    var p2 = R(a2, u2 || F, false, void 0, f2, false, s2);
    return W(p2) ? p2.join(H) : p2;
  } catch (e2) {
    if (e2.then) throw new Error('Use "renderToStringAsync" for suspenseful rendering.');
    throw e2;
  } finally {
    l$3[o] && l$3[o](a2, M), l$3[i] = l2, M.length = 0;
  }
}
function O(e2, t2) {
  var n2, r2 = e2.type, o2 = true;
  return e2[a] ? (o2 = false, (n2 = e2[a]).state = n2[s]) : n2 = new r2(e2.props, t2), e2[a] = n2, n2.__v = e2, n2.props = e2.props, n2.context = t2, v(n2), null == n2.state && (n2.state = F), null == n2[s] && (n2[s] = n2.state), r2.getDerivedStateFromProps ? n2.state = z({}, n2.state, r2.getDerivedStateFromProps(n2.props, n2.state)) : o2 && n2.componentWillMount ? (n2.componentWillMount(), n2.state = n2[s] !== n2.state ? n2[s] : n2.state) : !o2 && n2.componentWillUpdate && n2.componentWillUpdate(), $ && $(e2), n2.render(n2.props, n2.state, t2);
}
function R(t2, r2, o2, i2, u2, _2, b2) {
  if (null == t2 || true === t2 || false === t2 || t2 === H) return H;
  var x2 = typeof t2;
  if ("object" != x2) return "function" == x2 ? H : "string" == x2 ? g(t2) : t2 + H;
  if (W(t2)) {
    var k2, C2 = H;
    u2[c] = t2;
    for (var S$1 = t2.length, L2 = 0; L2 < S$1; L2++) {
      var E2 = t2[L2];
      if (null != E2 && "boolean" != typeof E2) {
        var j2, T2 = R(E2, r2, o2, i2, u2, _2, b2);
        "string" == typeof T2 ? C2 += T2 : (k2 || (k2 = new Array(S$1)), C2 && k2.push(C2), C2 = H, W(T2) ? (j2 = k2).push.apply(j2, T2) : k2.push(T2));
      }
    }
    return k2 ? (C2 && k2.push(C2), k2) : C2;
  }
  if (void 0 !== t2.constructor) return H;
  t2.__ = u2, D && D(t2);
  var Z = t2.type, M2 = t2.props;
  if ("function" == typeof Z) {
    var N2, q2, I2, K2 = r2;
    if (Z === S) {
      if ("tpl" in M2) {
        for (var G2 = H, Q2 = 0; Q2 < M2.tpl.length; Q2++) if (G2 += M2.tpl[Q2], M2.exprs && Q2 < M2.exprs.length) {
          var X2 = M2.exprs[Q2];
          if (null == X2) continue;
          "object" != typeof X2 || void 0 !== X2.constructor && !W(X2) ? G2 += X2 : G2 += R(X2, r2, o2, i2, t2, _2, b2);
        }
        return G2;
      }
      if ("UNSTABLE_comment" in M2) return "<!--" + g(M2.UNSTABLE_comment) + "-->";
      q2 = M2.children;
    } else {
      if (null != (N2 = Z.contextType)) {
        var Y = r2[N2.__c];
        K2 = Y ? Y.props.value : N2.__;
      }
      var ee = Z.prototype && "function" == typeof Z.prototype.render;
      if (ee) q2 = /**#__NOINLINE__**/
      O(t2, K2), I2 = t2[a];
      else {
        t2[a] = I2 = /**#__NOINLINE__**/
        A(t2, K2);
        for (var te = 0; y(I2) && te++ < 25; ) {
          m(I2), $ && $(t2);
          try {
            q2 = Z.call(I2, M2, K2);
          } catch (e2) {
            throw e2;
          }
        }
        v(I2);
      }
      if (null != I2.getChildContext && (r2 = z({}, r2, I2.getChildContext())), ee && l$3.errorBoundaries && (Z.getDerivedStateFromError || I2.componentDidCatch)) {
        q2 = null != q2 && q2.type === S && null == q2.key && null == q2.props.tpl ? q2.props.children : q2;
        try {
          return R(q2, r2, o2, i2, t2, _2, false);
        } catch (e2) {
          return Z.getDerivedStateFromError && (I2[s] = Z.getDerivedStateFromError(e2)), I2.componentDidCatch && I2.componentDidCatch(e2, F), y(I2) ? (q2 = O(t2, r2), null != (I2 = t2[a]).getChildContext && (r2 = z({}, r2, I2.getChildContext())), R(q2 = null != q2 && q2.type === S && null == q2.key && null == q2.props.tpl ? q2.props.children : q2, r2, o2, i2, t2, _2, b2)) : H;
        } finally {
          P && P(t2), U && U(t2);
        }
      }
    }
    q2 = null != q2 && q2.type === S && null == q2.key && null == q2.props.tpl ? q2.props.children : q2;
    try {
      var ne = R(q2, r2, o2, i2, t2, _2, b2);
      return P && P(t2), l$3.unmount && l$3.unmount(t2), t2._suspended ? B(ne) : ne;
    } catch (n2) {
      if (b2 && b2.onError) {
        var re2 = (function e2(n3) {
          return b2.onError(n3, t2, function(t3, n4) {
            try {
              return R(t3, r2, o2, i2, n4, _2, b2);
            } catch (t4) {
              return e2(t4);
            }
          });
        })(n2);
        if (void 0 !== re2) return re2;
        var oe = l$3.__e;
        return oe && oe(n2, t2), H;
      }
      throw n2;
    }
  }
  var ie, ae = "<" + Z, ce = H;
  for (var ue in M2) {
    var se = M2[ue];
    if ("function" != typeof (se = J(se) ? se.value : se) || "class" === ue || "className" === ue) {
      switch (ue) {
        case "children":
          ie = se;
          continue;
        case "key":
        case "ref":
        case "__self":
        case "__source":
          continue;
        case "htmlFor":
          if ("for" in M2) continue;
          ue = "for";
          break;
        case "className":
          if ("class" in M2) continue;
          ue = "class";
          break;
        case "defaultChecked":
          ue = "checked";
          break;
        case "defaultSelected":
          ue = "selected";
          break;
        case "defaultValue":
        case "value":
          switch (ue = "value", Z) {
            case "textarea":
              ie = se;
              continue;
            case "select":
              i2 = se;
              continue;
            case "option":
              i2 != se || "selected" in M2 || (ae += " selected");
          }
          break;
        case "dangerouslySetInnerHTML":
          ce = se && se.__html;
          continue;
        case "style":
          "object" == typeof se && (se = w(se));
          break;
        case "acceptCharset":
          ue = "accept-charset";
          break;
        case "httpEquiv":
          ue = "http-equiv";
          break;
        default:
          if (l.test(ue)) continue;
          f.test(ue) ? ue = ue.replace(f, "$1:$2").toLowerCase() : "-" !== ue[4] && !d.has(ue) || null == se ? o2 ? h.test(ue) && (ue = "panose1" === ue ? "panose-1" : ue.replace(/([A-Z])/g, "-$1").toLowerCase()) : p.test(ue) && (ue = ue.toLowerCase()) : se += H;
      }
      null != se && false !== se && (ae = true === se || se === H ? ae + " " + ue : ae + " " + ue + '="' + ("string" == typeof se ? g(se) : se + H) + '"');
    }
  }
  if (l.test(Z)) throw new Error(Z + " is not a valid HTML tag name in " + ae + ">");
  if (ce || ("string" == typeof ie ? ce = g(ie) : null != ie && false !== ie && true !== ie && (ce = R(ie, r2, "svg" === Z || "foreignObject" !== Z && o2, i2, t2, _2, b2))), P && P(t2), U && U(t2), !ce && V.has(Z)) return ae + "/>";
  var le = "</" + Z + ">", fe = ae + ">";
  return W(ce) ? [fe].concat(ce, [le]) : "string" != typeof ce ? [fe, ce, le] : fe + ce + le;
}
var V = /* @__PURE__ */ new Set(["area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr"]);
function J(e2) {
  return null !== e2 && "object" == typeof e2 && "function" == typeof e2.peek && "value" in e2;
}
const ENCODER = new TextEncoder();
function isWebSocketHandlers(value) {
  if (typeof value !== "object" || value === null) return false;
  const v2 = value;
  return typeof v2.open === "function" || typeof v2.message === "function" || typeof v2.close === "function" || typeof v2.error === "function";
}
let getBuildCache;
let getInternals;
let setAdditionalStyles;
class Context {
  constructor(req, url, info, route, params, config2, next, buildCache) {
    __privateAdd(this, _internal, {
      app: null,
      layouts: []
    });
    /** Reference to the resolved Fresh configuration */
    __publicField(this, "config");
    /**
     * The request url parsed into an `URL` instance. This is typically used
     * to apply logic based on the pathname of the incoming url or when
     * certain search parameters are set.
     */
    __publicField(this, "url");
    /** The original incoming {@linkcode Request} object. */
    __publicField(this, "req");
    /** The matched route pattern. */
    __publicField(this, "route");
    /** The url parameters of the matched route pattern. */
    __publicField(this, "params");
    /** State object that is shared with all middlewares. */
    __publicField(this, "state", {});
    __publicField(this, "data");
    /** Error value if an error was caught (Default: null) */
    __publicField(this, "error", null);
    __publicField(this, "info");
    /**
     * Whether the current Request is a partial request.
     *
     * Partials in Fresh will append the query parameter
     * {@linkcode PARTIAL_SEARCH_PARAM} to the URL. This property can
     * be used to determine if only `<Partial>`'s need to be rendered.
     */
    __publicField(this, "isPartial");
    /**
     * Call the next middleware.
     * ```ts
     * const myMiddleware: Middleware = (ctx) => {
     *   // do something
     *
     *   // Call the next middleware
     *   return ctx.next();
     * }
     *
     * const myMiddleware2: Middleware = async (ctx) => {
     *   // do something before the next middleware
     *   doSomething()
     *
     *   const res = await ctx.next();
     *
     *   // do something after the middleware
     *   doSomethingAfter()
     *
     *   // Return the `Response`
     *   return res
     * }
     */
    __publicField(this, "next");
    __privateAdd(this, _buildCache);
    __privateAdd(this, _additionalStyles, null);
    __publicField(this, "Component");
    this.url = url;
    this.req = req;
    this.info = info;
    this.params = params;
    this.route = route;
    this.config = config2;
    this.isPartial = url.searchParams.has(PARTIAL_SEARCH_PARAM);
    this.next = next;
    __privateSet(this, _buildCache, buildCache);
  }
  /**
   * Return a redirect response to the specified path. This is the
   * preferred way to do redirects in Fresh.
   *
   * ```ts
   * ctx.redirect("/foo/bar") // redirect user to "<yoursite>/foo/bar"
   *
   * // Disallows protocol relative URLs for improved security. This
   * // redirects the user to `<yoursite>/evil.com` which is safe,
   * // instead of redirecting to `http://evil.com`.
   * ctx.redirect("//evil.com/");
   * ```
   */
  redirect(pathOrUrl, status = 302) {
    let location = pathOrUrl;
    if (pathOrUrl !== "/" && pathOrUrl.startsWith("/")) {
      let idx = pathOrUrl.indexOf("?");
      if (idx === -1) {
        idx = pathOrUrl.indexOf("#");
      }
      const pathname = idx > -1 ? pathOrUrl.slice(0, idx) : pathOrUrl;
      const search = idx > -1 ? pathOrUrl.slice(idx) : "";
      location = `${pathname.replaceAll(/\/+/g, "/")}${search}`;
    }
    if (this.isPartial) {
      const hashIdx = location.indexOf("#");
      const base = hashIdx > -1 ? location.slice(0, hashIdx) : location;
      const hash = hashIdx > -1 ? location.slice(hashIdx) : "";
      const separator = base.includes("?") ? "&" : "?";
      location = `${base}${separator}${PARTIAL_SEARCH_PARAM}=true${hash}`;
    }
    return new Response(null, {
      status,
      headers: {
        location
      }
    });
  }
  /**
   * Render JSX and return an HTML `Response` instance.
   * ```tsx
   * ctx.render(<h1>hello world</h1>);
   * ```
   */
  async render(vnode, init = {}, config2 = {}) {
    if (arguments.length === 0) {
      throw new Error(`No arguments passed to: ctx.render()`);
    } else if (vnode !== null && !t$2(vnode)) {
      throw new Error(`Non-JSX element passed to: ctx.render()`);
    }
    const defs = config2.skipInheritedLayouts ? [] : __privateGet(this, _internal).layouts;
    const appDef = config2.skipAppWrapper ? null : __privateGet(this, _internal).app;
    const props = this;
    for (let i2 = defs.length - 1; i2 >= 0; i2--) {
      const child = vnode;
      props.Component = () => child;
      const def = defs[i2];
      const result = await renderRouteComponent(this, def, () => child);
      if (result instanceof Response) {
        return result;
      }
      vnode = result;
    }
    let appChild = vnode;
    let appVNode;
    let hasApp = true;
    if (isAsyncAnyComponent(appDef)) {
      props.Component = () => appChild;
      const result = await renderAsyncAnyComponent(appDef, props);
      if (result instanceof Response) {
        return result;
      }
      appVNode = result;
    } else if (appDef !== null) {
      appVNode = k$2(appDef, {
        Component: () => appChild,
        config: this.config,
        data: null,
        error: this.error,
        info: this.info,
        isPartial: this.isPartial,
        params: this.params,
        req: this.req,
        state: this.state,
        url: this.url,
        route: this.route
      });
    } else {
      hasApp = false;
      appVNode = appChild ?? k$2(S, null);
    }
    const headers = getHeadersFromInit(init);
    headers.set("Content-Type", "text/html; charset=utf-8");
    const responseInit = {
      status: init.status ?? 200,
      headers,
      statusText: init.statusText
    };
    let partialId = "";
    if (this.url.searchParams.has(PARTIAL_SEARCH_PARAM)) {
      partialId = crypto.randomUUID();
      headers.set("X-Fresh-Id", partialId);
    }
    let renderNonce = "";
    const html = tracer.startActiveSpan("render", (span) => {
      span.setAttribute("fresh.span_type", "render");
      const state = new RenderState(this, __privateGet(this, _buildCache), partialId);
      if (__privateGet(this, _additionalStyles) !== null) {
        for (let i2 = 0; i2 < __privateGet(this, _additionalStyles).length; i2++) {
          const css2 = __privateGet(this, _additionalStyles)[i2];
          state.islandAssets.add(css2);
        }
      }
      try {
        setRenderState(state);
        let html2 = I(vnode ?? k$2(S, null));
        if (hasApp) {
          appChild = a$2([html2]);
          html2 = I(appVNode);
        }
        if (!state.renderedHtmlBody || !state.renderedHtmlHead || !state.renderedHtmlTag) {
          let fallback = a$2([html2]);
          if (!state.renderedHtmlBody) {
            let scripts = null;
            if (this.url.pathname !== this.config.basePath + DEV_ERROR_OVERLAY_URL) {
              scripts = k$2(FreshScripts, null);
            }
            fallback = k$2("body", null, fallback, scripts);
          }
          if (!state.renderedHtmlHead) {
            fallback = k$2(S, null, k$2("head", null, k$2("meta", {
              charset: "utf-8"
            })), fallback);
          }
          if (!state.renderedHtmlTag) {
            fallback = k$2("html", null, fallback);
          }
          html2 = I(fallback);
        }
        return `<!DOCTYPE html>${html2}`;
      } catch (err) {
        if (err instanceof Error) {
          span.recordException(err);
        } else {
          span.setStatus({
            code: _SpanStatusCode.ERROR,
            message: String(err)
          });
        }
        throw err;
      } finally {
        const basePath = this.config.basePath;
        const linkParts = [];
        if (state.needsClientRuntime || state.buildCache.hmrClientEntry !== void 0) {
          const runtimeUrl = state.buildCache.clientEntry.startsWith(".") ? state.buildCache.clientEntry.slice(1) : state.buildCache.clientEntry;
          linkParts.push(`<${encodeURI(`${basePath}${runtimeUrl}`)}>; rel="modulepreload"; as="script"`);
          state.islands.forEach((island) => {
            const specifier = `${basePath}${island.file.startsWith(".") ? island.file.slice(1) : island.file}`;
            linkParts.push(`<${encodeURI(specifier)}>; rel="modulepreload"; as="script"`);
          });
        }
        if (linkParts.length > 0) {
          headers.append("Link", linkParts.join(", "));
        }
        renderNonce = state.nonce;
        state.clear();
        setRenderState(null);
        span.end();
      }
    });
    const response = new Response(html, responseInit);
    response[NONCE_SYMBOL] = renderNonce;
    return response;
  }
  /**
   * Respond with text. Sets `Content-Type: text/plain`.
   * ```tsx
   * app.use(ctx => ctx.text("Hello World!"));
   * ```
   */
  text(content, init) {
    return new Response(content, init);
  }
  /**
   * Respond with html string. Sets `Content-Type: text/html`.
   * ```tsx
   * app.get("/", ctx => ctx.html("<h1>foo</h1>"));
   * ```
   */
  html(content, init) {
    const headers = getHeadersFromInit(init);
    headers.set("Content-Type", "text/html; charset=utf-8");
    return new Response(content, {
      ...init,
      headers
    });
  }
  /**
   * Respond with json string, same as `Response.json()`. Sets
   * `Content-Type: application/json`.
   * ```tsx
   * app.get("/", ctx => ctx.json({ foo: 123 }));
   * ```
   */
  // deno-lint-ignore no-explicit-any
  json(content, init) {
    return Response.json(content, init);
  }
  /**
   * Helper to stream a sync or async iterable and encode text
   * automatically.
   *
   * ```tsx
   * function* gen() {
   *   yield "foo";
   *   yield "bar";
   * }
   *
   * app.use(ctx => ctx.stream(gen()))
   * ```
   *
   * Or pass in the function directly:
   *
   * ```tsx
   * app.use(ctx => {
   *   return ctx.stream(function* gen() {
   *     yield "foo";
   *     yield "bar";
   *   });
   * );
   * ```
   */
  stream(stream, init) {
    const raw = typeof stream === "function" ? stream() : stream;
    const body = ReadableStream.from(raw).pipeThrough(new TransformStream({
      transform(chunk, controller) {
        if (chunk instanceof Uint8Array) {
          controller.enqueue(chunk);
        } else if (chunk === void 0) {
          controller.enqueue(void 0);
        } else {
          const raw2 = ENCODER.encode(String(chunk));
          controller.enqueue(raw2);
        }
      }
    }));
    return new Response(body, init);
  }
  upgrade(handlersOrOptions, maybeOptions) {
    let handlers2;
    let options2;
    if (isWebSocketHandlers(handlersOrOptions)) {
      handlers2 = handlersOrOptions;
      options2 = maybeOptions;
    } else {
      options2 = handlersOrOptions;
    }
    if (this.req.headers.get("upgrade")?.toLowerCase() !== "websocket") {
      throw new HttpError(400, "Expected a WebSocket upgrade request");
    }
    const {
      socket,
      response
    } = Deno.upgradeWebSocket(this.req, options2);
    if (handlers2 === void 0) {
      return {
        socket,
        response
      };
    }
    if (handlers2.open) {
      socket.addEventListener("open", () => handlers2.open(socket));
    }
    if (handlers2.message) {
      socket.addEventListener("message", (ev) => handlers2.message(socket, ev));
    }
    if (handlers2.close) {
      socket.addEventListener("close", (ev) => handlers2.close(socket, ev.code, ev.reason));
    }
    if (handlers2.error) {
      socket.addEventListener("error", (ev) => handlers2.error(socket, ev));
    }
    return response;
  }
}
_internal = new WeakMap();
_buildCache = new WeakMap();
_additionalStyles = new WeakMap();
getInternals = (ctx) => __privateGet(ctx, _internal);
getBuildCache = (ctx) => __privateGet(ctx, _buildCache);
setAdditionalStyles = (ctx, css2) => __privateSet(ctx, _additionalStyles, css2);
function getHeadersFromInit(init) {
  if (init === void 0) {
    return new Headers();
  }
  return init.headers !== void 0 ? init.headers instanceof Headers ? init.headers : new Headers(init.headers) : new Headers();
}
function newByMethod() {
  return {
    GET: null,
    POST: null,
    PATCH: null,
    DELETE: null,
    PUT: null,
    HEAD: null,
    OPTIONS: null
  };
}
const IS_PATTERN = /[*:{}+?()]/;
const EMPTY = [];
class UrlPatternRouter {
  #statics = /* @__PURE__ */ new Map();
  #dynamics = /* @__PURE__ */ new Map();
  #dynamicArr = [];
  #allowed = /* @__PURE__ */ new Map();
  getAllowedMethods(pattern) {
    const allowed = this.#allowed.get(pattern);
    if (allowed === void 0) return EMPTY;
    return Array.from(allowed);
  }
  add(method, pathname, item) {
    let allowed = this.#allowed.get(pathname);
    if (allowed === void 0) {
      allowed = /* @__PURE__ */ new Set();
      this.#allowed.set(pathname, allowed);
    }
    allowed.add(method);
    let byMethod;
    if (IS_PATTERN.test(pathname)) {
      let def = this.#dynamics.get(pathname);
      if (def === void 0) {
        def = {
          pattern: new URLPattern({
            pathname
          }),
          byMethod: newByMethod()
        };
        this.#dynamics.set(pathname, def);
        this.#dynamicArr.push(def);
      }
      byMethod = def.byMethod;
    } else {
      let def = this.#statics.get(pathname);
      if (def === void 0) {
        def = {
          pattern: pathname,
          byMethod: newByMethod()
        };
        this.#statics.set(pathname, def);
      }
      byMethod = def.byMethod;
    }
    if (byMethod[method] === null) {
      byMethod[method] = item;
    }
  }
  match(method, url) {
    const result = {
      params: /* @__PURE__ */ Object.create(null),
      item: null,
      methodMatch: false,
      pattern: null
    };
    let pathname = url.pathname;
    let staticMatch = this.#statics.get(pathname);
    if (staticMatch === void 0 && pathname !== "/") {
      const alt = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname + "/";
      const altMatch = this.#statics.get(alt);
      if (altMatch !== void 0) {
        staticMatch = altMatch;
        pathname = alt;
      }
    }
    if (staticMatch !== void 0) {
      result.pattern = pathname;
      let item = staticMatch.byMethod[method];
      if (method === "HEAD" && item === null) {
        item = staticMatch.byMethod.GET;
      }
      if (item !== null) {
        result.methodMatch = true;
        result.item = item;
      }
      return result;
    }
    for (let i2 = 0; i2 < this.#dynamicArr.length; i2++) {
      const route = this.#dynamicArr[i2];
      const match = route.pattern.exec(url);
      if (match === null) continue;
      result.pattern = route.pattern.pathname;
      let item = route.byMethod[method];
      if (method === "HEAD" && item === null) {
        item = route.byMethod.GET;
      }
      if (item !== null) {
        result.methodMatch = true;
        result.item = item;
        for (const [key, value] of Object.entries(match.pathname.groups)) {
          result.params[key] = value === void 0 ? "" : decodeURI(value);
        }
      }
      break;
    }
    return result;
  }
}
function patternToSegments(path, root2, includeLast = false) {
  const out = [root2];
  if (path === "/" || path === "*" || path === "/*") return out;
  const cleaned = path.replace(/\{[^}]*\}\??/g, "");
  let start = -1;
  for (let i2 = 0; i2 < cleaned.length; i2++) {
    const ch = cleaned[i2];
    if (ch === "/") {
      if (i2 > 0) {
        const raw = cleaned.slice(start + 1, i2);
        out.push(raw);
      }
      start = i2;
    }
  }
  if (includeLast && start < cleaned.length - 1) {
    out.push(cleaned.slice(start + 1));
  }
  return out;
}
function mergePath(basePath, path, isMounting) {
  if (basePath.endsWith("*")) basePath = basePath.slice(0, -1);
  if (basePath === "/") basePath = "";
  if (path === "*") path = isMounting ? "" : "/*";
  else if (path === "/*") path = "/*";
  const s2 = basePath !== "" && path === "/" ? "" : path;
  return basePath + s2;
}
function toRoutePath(path) {
  if (path === "") return "*";
  return path;
}
const STATUS_CODE$1 = {
  /** RFC 7231, 6.2.1 */
  Continue: 100,
  /** RFC 7231, 6.2.2 */
  SwitchingProtocols: 101,
  /** RFC 2518, 10.1 */
  Processing: 102,
  /** RFC 8297 **/
  EarlyHints: 103,
  /** RFC 7231, 6.3.1 */
  OK: 200,
  /** RFC 7231, 6.3.2 */
  Created: 201,
  /** RFC 7231, 6.3.3 */
  Accepted: 202,
  /** RFC 7231, 6.3.4 */
  NonAuthoritativeInfo: 203,
  /** RFC 7231, 6.3.5 */
  NoContent: 204,
  /** RFC 7231, 6.3.6 */
  ResetContent: 205,
  /** RFC 7233, 4.1 */
  PartialContent: 206,
  /** RFC 4918, 11.1 */
  MultiStatus: 207,
  /** RFC 5842, 7.1 */
  AlreadyReported: 208,
  /** RFC 3229, 10.4.1 */
  IMUsed: 226,
  /** RFC 7231, 6.4.1 */
  MultipleChoices: 300,
  /** RFC 7231, 6.4.2 */
  MovedPermanently: 301,
  /** RFC 7231, 6.4.3 */
  Found: 302,
  /** RFC 7231, 6.4.4 */
  SeeOther: 303,
  /** RFC 7232, 4.1 */
  NotModified: 304,
  /** RFC 7231, 6.4.5 */
  UseProxy: 305,
  /** RFC 7231, 6.4.7 */
  TemporaryRedirect: 307,
  /** RFC 7538, 3 */
  PermanentRedirect: 308,
  /** RFC 7231, 6.5.1 */
  BadRequest: 400,
  /** RFC 7235, 3.1 */
  Unauthorized: 401,
  /** RFC 7231, 6.5.2 */
  PaymentRequired: 402,
  /** RFC 7231, 6.5.3 */
  Forbidden: 403,
  /** RFC 7231, 6.5.4 */
  NotFound: 404,
  /** RFC 7231, 6.5.5 */
  MethodNotAllowed: 405,
  /** RFC 7231, 6.5.6 */
  NotAcceptable: 406,
  /** RFC 7235, 3.2 */
  ProxyAuthRequired: 407,
  /** RFC 7231, 6.5.7 */
  RequestTimeout: 408,
  /** RFC 7231, 6.5.8 */
  Conflict: 409,
  /** RFC 7231, 6.5.9 */
  Gone: 410,
  /** RFC 7231, 6.5.10 */
  LengthRequired: 411,
  /** RFC 7232, 4.2 */
  PreconditionFailed: 412,
  /** RFC 7231, 6.5.11 */
  ContentTooLarge: 413,
  /** RFC 7231, 6.5.12 */
  URITooLong: 414,
  /** RFC 7231, 6.5.13 */
  UnsupportedMediaType: 415,
  /** RFC 7233, 4.4 */
  RangeNotSatisfiable: 416,
  /** RFC 7231, 6.5.14 */
  ExpectationFailed: 417,
  /** RFC 7168, 2.3.3 */
  Teapot: 418,
  /** RFC 7540, 9.1.2 */
  MisdirectedRequest: 421,
  /** RFC 4918, 11.2 */
  UnprocessableEntity: 422,
  /** RFC 4918, 11.3 */
  Locked: 423,
  /** RFC 4918, 11.4 */
  FailedDependency: 424,
  /** RFC 8470, 5.2 */
  TooEarly: 425,
  /** RFC 7231, 6.5.15 */
  UpgradeRequired: 426,
  /** RFC 6585, 3 */
  PreconditionRequired: 428,
  /** RFC 6585, 4 */
  TooManyRequests: 429,
  /** RFC 6585, 5 */
  RequestHeaderFieldsTooLarge: 431,
  /** RFC 7725, 3 */
  UnavailableForLegalReasons: 451,
  /** RFC 7231, 6.6.1 */
  InternalServerError: 500,
  /** RFC 7231, 6.6.2 */
  NotImplemented: 501,
  /** RFC 7231, 6.6.3 */
  BadGateway: 502,
  /** RFC 7231, 6.6.4 */
  ServiceUnavailable: 503,
  /** RFC 7231, 6.6.5 */
  GatewayTimeout: 504,
  /** RFC 7231, 6.6.6 */
  HTTPVersionNotSupported: 505,
  /** RFC 2295, 8.1 */
  VariantAlsoNegotiates: 506,
  /** RFC 4918, 11.5 */
  InsufficientStorage: 507,
  /** RFC 5842, 7.2 */
  LoopDetected: 508,
  /** RFC 2774, 7 */
  NotExtended: 510,
  /** RFC 6585, 6 */
  NetworkAuthenticationRequired: 511
};
const STATUS_TEXT$1 = {
  [STATUS_CODE$1.Accepted]: "Accepted",
  [STATUS_CODE$1.AlreadyReported]: "Already Reported",
  [STATUS_CODE$1.BadGateway]: "Bad Gateway",
  [STATUS_CODE$1.BadRequest]: "Bad Request",
  [STATUS_CODE$1.Conflict]: "Conflict",
  [STATUS_CODE$1.Continue]: "Continue",
  [STATUS_CODE$1.Created]: "Created",
  [STATUS_CODE$1.EarlyHints]: "Early Hints",
  [STATUS_CODE$1.ExpectationFailed]: "Expectation Failed",
  [STATUS_CODE$1.FailedDependency]: "Failed Dependency",
  [STATUS_CODE$1.Forbidden]: "Forbidden",
  [STATUS_CODE$1.Found]: "Found",
  [STATUS_CODE$1.GatewayTimeout]: "Gateway Timeout",
  [STATUS_CODE$1.Gone]: "Gone",
  [STATUS_CODE$1.HTTPVersionNotSupported]: "HTTP Version Not Supported",
  [STATUS_CODE$1.IMUsed]: "IM Used",
  [STATUS_CODE$1.InsufficientStorage]: "Insufficient Storage",
  [STATUS_CODE$1.InternalServerError]: "Internal Server Error",
  [STATUS_CODE$1.LengthRequired]: "Length Required",
  [STATUS_CODE$1.Locked]: "Locked",
  [STATUS_CODE$1.LoopDetected]: "Loop Detected",
  [STATUS_CODE$1.MethodNotAllowed]: "Method Not Allowed",
  [STATUS_CODE$1.MisdirectedRequest]: "Misdirected Request",
  [STATUS_CODE$1.MovedPermanently]: "Moved Permanently",
  [STATUS_CODE$1.MultiStatus]: "Multi Status",
  [STATUS_CODE$1.MultipleChoices]: "Multiple Choices",
  [STATUS_CODE$1.NetworkAuthenticationRequired]: "Network Authentication Required",
  [STATUS_CODE$1.NoContent]: "No Content",
  [STATUS_CODE$1.NonAuthoritativeInfo]: "Non Authoritative Info",
  [STATUS_CODE$1.NotAcceptable]: "Not Acceptable",
  [STATUS_CODE$1.NotExtended]: "Not Extended",
  [STATUS_CODE$1.NotFound]: "Not Found",
  [STATUS_CODE$1.NotImplemented]: "Not Implemented",
  [STATUS_CODE$1.NotModified]: "Not Modified",
  [STATUS_CODE$1.OK]: "OK",
  [STATUS_CODE$1.PartialContent]: "Partial Content",
  [STATUS_CODE$1.PaymentRequired]: "Payment Required",
  [STATUS_CODE$1.PermanentRedirect]: "Permanent Redirect",
  [STATUS_CODE$1.PreconditionFailed]: "Precondition Failed",
  [STATUS_CODE$1.PreconditionRequired]: "Precondition Required",
  [STATUS_CODE$1.Processing]: "Processing",
  [STATUS_CODE$1.ProxyAuthRequired]: "Proxy Auth Required",
  [STATUS_CODE$1.ContentTooLarge]: "Content Too Large",
  [STATUS_CODE$1.RequestHeaderFieldsTooLarge]: "Request Header Fields Too Large",
  [STATUS_CODE$1.RequestTimeout]: "Request Timeout",
  [STATUS_CODE$1.URITooLong]: "URI Too Long",
  [STATUS_CODE$1.RangeNotSatisfiable]: "Range Not Satisfiable",
  [STATUS_CODE$1.ResetContent]: "Reset Content",
  [STATUS_CODE$1.SeeOther]: "See Other",
  [STATUS_CODE$1.ServiceUnavailable]: "Service Unavailable",
  [STATUS_CODE$1.SwitchingProtocols]: "Switching Protocols",
  [STATUS_CODE$1.Teapot]: "I'm a teapot",
  [STATUS_CODE$1.TemporaryRedirect]: "Temporary Redirect",
  [STATUS_CODE$1.TooEarly]: "Too Early",
  [STATUS_CODE$1.TooManyRequests]: "Too Many Requests",
  [STATUS_CODE$1.Unauthorized]: "Unauthorized",
  [STATUS_CODE$1.UnavailableForLegalReasons]: "Unavailable For Legal Reasons",
  [STATUS_CODE$1.UnprocessableEntity]: "Unprocessable Entity",
  [STATUS_CODE$1.UnsupportedMediaType]: "Unsupported Media Type",
  [STATUS_CODE$1.UpgradeRequired]: "Upgrade Required",
  [STATUS_CODE$1.UseProxy]: "Use Proxy",
  [STATUS_CODE$1.VariantAlsoNegotiates]: "Variant Also Negotiates"
};
function isHandlerByMethod(handler2) {
  return handler2 !== null && !Array.isArray(handler2) && typeof handler2 === "object";
}
function compileMiddlewares(middlewares, onError) {
  if (middlewares.length === 0) return (ctx) => ctx.next();
  let chain = (_ctx, tail) => tail();
  for (let i2 = middlewares.length - 1; i2 >= 0; i2--) {
    const nextChain = chain;
    let middleware = middlewares[i2];
    chain = async (ctx, tail) => {
      const internals = getInternals(ctx);
      const {
        app: prevApp,
        layouts: prevLayouts
      } = internals;
      ctx.next = () => Promise.resolve(nextChain(ctx, tail));
      try {
        const result = await middleware(ctx);
        if (typeof result === "function") {
          middleware = result;
          return await result(ctx);
        }
        return result;
      } catch (err) {
        if (ctx.error !== err) {
          ctx.error = err;
          if (onError !== void 0) {
            onError(err);
          }
        }
        throw err;
      } finally {
        internals.app = prevApp;
        internals.layouts = prevLayouts;
      }
    };
  }
  const count = middlewares.length;
  return (ctx) => {
    const tail = ctx.next;
    return tracer.startActiveSpan("middlewares", {
      attributes: {
        "fresh.middleware.count": count
      }
    }, async (span) => {
      try {
        return await chain(ctx, tail);
      } catch (err) {
        recordSpanError(span, err);
        throw err;
      } finally {
        span.end();
      }
    });
  };
}
function newSegment(pattern, parent) {
  return {
    pattern,
    middlewares: [],
    layout: null,
    app: null,
    errorRoute: null,
    notFound: null,
    parent,
    children: /* @__PURE__ */ new Map()
  };
}
function getOrCreateSegment(root2, path, includeLast) {
  let current = root2;
  const segments = patternToSegments(path, root2.pattern, includeLast);
  for (let i2 = 0; i2 < segments.length; i2++) {
    const seg = segments[i2];
    if (seg === root2.pattern) {
      current = root2;
    } else {
      let child = current.children.get(seg);
      if (child === void 0) {
        child = newSegment(seg, current);
        current.children.set(seg, child);
      }
      current = child;
    }
  }
  return current;
}
function segmentToMiddlewares(segment) {
  const result = [];
  const stack = [];
  let current = segment;
  while (current !== null) {
    stack.push(current);
    current = current.parent;
  }
  const root2 = stack.at(-1);
  for (let i2 = stack.length - 1; i2 >= 0; i2--) {
    const seg = stack[i2];
    const {
      layout,
      app: app2,
      errorRoute
    } = seg;
    result.push(async function segmentMiddleware(ctx) {
      const internals = getInternals(ctx);
      const prevApp = internals.app;
      const prevLayouts = internals.layouts;
      if (app2 !== null) {
        internals.app = app2;
      }
      if (layout !== null) {
        if (layout.config?.skipAppWrapper) {
          internals.app = null;
        }
        const def = {
          props: null,
          component: layout.component
        };
        if (layout.config?.skipInheritedLayouts) {
          internals.layouts = [def];
        } else {
          internals.layouts = [...internals.layouts, def];
        }
      }
      try {
        return await ctx.next();
      } catch (err) {
        const status = err instanceof HttpError ? err.status : 500;
        if (root2.notFound !== null && status === 404) {
          return await root2.notFound(ctx);
        }
        if (errorRoute !== null) {
          return await renderRoute(ctx, errorRoute, status);
        }
        throw err;
      } finally {
        internals.app = prevApp;
        internals.layouts = prevLayouts;
      }
    });
    if (seg.middlewares.length > 0) {
      result.push(...seg.middlewares);
    }
  }
  return result;
}
async function renderRoute(ctx, route, status = 200) {
  const internals = getInternals(ctx);
  if (route.config?.skipAppWrapper) {
    internals.app = null;
  }
  if (route.config?.skipInheritedLayouts) {
    internals.layouts = [];
  }
  const method = ctx.req.method.toUpperCase();
  const handlers2 = route.handler;
  if (handlers2 === void 0) {
    throw new Error(`Unexpected missing handlers`);
  }
  const headers = new Headers();
  headers.set("Content-Type", "text/html;charset=utf-8");
  const res = await tracer.startActiveSpan("handler", {
    attributes: {
      "fresh.span_type": "fs_routes/handler"
    }
  }, async (span) => {
    try {
      let fn = null;
      if (isHandlerByMethod(handlers2)) {
        if (handlers2[method] !== void 0) {
          fn = handlers2[method];
        } else if (method === "HEAD" && handlers2.GET !== void 0) {
          fn = handlers2.GET;
        }
      } else {
        fn = handlers2;
      }
      if (fn === null) return await ctx.next();
      return await fn(ctx);
    } catch (err) {
      recordSpanError(span, err);
      throw err;
    } finally {
      span.end();
    }
  });
  if (res instanceof Response) {
    return res;
  }
  if (typeof res.status === "number") {
    status = res.status;
  }
  if (res.headers !== void 0) {
    if (res.headers instanceof Headers) {
      res.headers.forEach((value, key) => {
        headers.set(key, value);
      });
    } else if (Array.isArray(res.headers)) {
      for (let i2 = 0; i2 < res.headers.length; i2++) {
        const entry = res.headers[i2];
        headers.set(entry[0], entry[1]);
      }
    } else {
      for (const [name, value] of Object.entries(res.headers)) {
        headers.set(name, value);
      }
    }
  }
  let vnode = null;
  if (route.component !== void 0) {
    const result = await renderRouteComponent(ctx, {
      component: route.component,
      // deno-lint-ignore no-explicit-any
      props: res.data
    }, () => null);
    if (result instanceof Response) {
      return result;
    }
    vnode = result;
  }
  return ctx.render(vnode, {
    headers,
    status
  });
}
const DEFAULT_NOT_FOUND = () => {
  throw new HttpError(404);
};
const DEFAULT_NOT_ALLOWED_METHOD = () => {
  throw new HttpError(405);
};
const DEFAULT_RENDER = () => (
  // deno-lint-ignore no-explicit-any
  Promise.resolve({
    data: {}
  })
);
function ensureHandler(route) {
  if (route.handler === void 0) {
    route.handler = route.component !== void 0 ? DEFAULT_RENDER : DEFAULT_NOT_FOUND;
  } else if (isHandlerByMethod(route.handler)) {
    if (route.component !== void 0 && !route.handler.GET) {
      route.handler.GET = DEFAULT_RENDER;
    }
  }
}
var CommandType = /* @__PURE__ */ (function(CommandType2) {
  CommandType2["Middleware"] = "middleware";
  CommandType2["Layout"] = "layout";
  CommandType2["App"] = "app";
  CommandType2["Route"] = "route";
  CommandType2["Error"] = "error";
  CommandType2["NotFound"] = "notFound";
  CommandType2["Handler"] = "handler";
  CommandType2["FsRoute"] = "fsRoute";
  return CommandType2;
})({});
function newErrorCmd(pattern, routeOrMiddleware, includeLastSegment) {
  const route = typeof routeOrMiddleware === "function" ? {
    handler: routeOrMiddleware
  } : routeOrMiddleware;
  ensureHandler(route);
  return {
    type: "error",
    pattern,
    item: route,
    includeLastSegment
  };
}
function newAppCmd(component) {
  return {
    type: "app",
    component
  };
}
function newLayoutCmd(pattern, component, config2, includeLastSegment) {
  return {
    type: "layout",
    pattern,
    component,
    config: config2,
    includeLastSegment
  };
}
function newMiddlewareCmd(pattern, fns, includeLastSegment) {
  return {
    type: "middleware",
    pattern,
    fns,
    includeLastSegment
  };
}
function newNotFoundCmd(routeOrMiddleware) {
  const route = typeof routeOrMiddleware === "function" ? {
    handler: routeOrMiddleware
  } : routeOrMiddleware;
  ensureHandler(route);
  return {
    type: "notFound",
    fn: (ctx) => renderRoute(ctx, route)
  };
}
function newRouteCmd(pattern, route, config2, includeLastSegment) {
  let normalized;
  if (isLazy(route)) {
    normalized = async () => {
      const result = await route();
      ensureHandler(result);
      return result;
    };
  } else {
    ensureHandler(route);
    normalized = route;
  }
  return {
    type: "route",
    pattern,
    route: normalized,
    config: config2,
    includeLastSegment
  };
}
function newHandlerCmd(method, pattern, fns, includeLastSegment) {
  return {
    type: "handler",
    pattern,
    method,
    fns,
    includeLastSegment
  };
}
function applyCommands(router, commands, basePath, onError) {
  const root2 = newSegment("", null);
  applyCommandsInner(root2, router, commands, basePath, onError);
  const rootMiddlewares = segmentToMiddlewares(root2);
  return {
    rootHandler: compileMiddlewares(rootMiddlewares, onError)
  };
}
function applyCommandsInner(root2, router, commands, basePath, onError) {
  for (let i2 = 0; i2 < commands.length; i2++) {
    const cmd = commands[i2];
    switch (cmd.type) {
      case "middleware": {
        const segment = getOrCreateSegment(root2, cmd.pattern, cmd.includeLastSegment);
        segment.middlewares.push(...cmd.fns);
        break;
      }
      case "notFound": {
        root2.notFound = cmd.fn;
        break;
      }
      case "error": {
        const segment = getOrCreateSegment(root2, cmd.pattern, cmd.includeLastSegment);
        segment.errorRoute = cmd.item;
        break;
      }
      case "app": {
        root2.app = cmd.component;
        break;
      }
      case "layout": {
        const segment = getOrCreateSegment(root2, cmd.pattern, cmd.includeLastSegment);
        segment.layout = {
          component: cmd.component,
          config: cmd.config ?? null
        };
        break;
      }
      case "route": {
        const {
          pattern,
          route,
          config: config2
        } = cmd;
        const segment = getOrCreateSegment(root2, pattern, cmd.includeLastSegment);
        const fns = segmentToMiddlewares(segment);
        if (isLazy(route)) {
          const routePath = mergePath(basePath, config2?.routeOverride ?? pattern, false);
          let def;
          fns.push(async (ctx) => {
            if (def === void 0) {
              def = await route();
            }
            if (def.css !== void 0) {
              setAdditionalStyles(ctx, def.css);
            }
            return renderRoute(ctx, def);
          });
          const compiled = compileMiddlewares(fns, onError);
          if (config2 === void 0 || config2.methods === "ALL") {
            router.add("GET", routePath, compiled);
            router.add("DELETE", routePath, compiled);
            router.add("HEAD", routePath, compiled);
            router.add("OPTIONS", routePath, compiled);
            router.add("PATCH", routePath, compiled);
            router.add("POST", routePath, compiled);
            router.add("PUT", routePath, compiled);
          } else if (Array.isArray(config2.methods)) {
            for (let i3 = 0; i3 < config2.methods.length; i3++) {
              const method = config2.methods[i3];
              router.add(method, routePath, compiled);
            }
          }
        } else {
          fns.push((ctx) => renderRoute(ctx, route));
          const routePath = toRoutePath(mergePath(basePath, route.config?.routeOverride ?? pattern, false));
          const compiled = compileMiddlewares(fns, onError);
          if (typeof route.handler === "function") {
            router.add("GET", routePath, compiled);
            router.add("DELETE", routePath, compiled);
            router.add("HEAD", routePath, compiled);
            router.add("OPTIONS", routePath, compiled);
            router.add("PATCH", routePath, compiled);
            router.add("POST", routePath, compiled);
            router.add("PUT", routePath, compiled);
          } else if (isHandlerByMethod(route.handler)) {
            for (const method of Object.keys(route.handler)) {
              router.add(method, routePath, compiled);
            }
          }
        }
        break;
      }
      case "handler": {
        const {
          pattern,
          fns,
          method
        } = cmd;
        const segment = getOrCreateSegment(root2, pattern, cmd.includeLastSegment);
        const result = segmentToMiddlewares(segment);
        result.push(...fns);
        const compiled = compileMiddlewares(result, onError);
        const resPath = toRoutePath(mergePath(basePath, pattern, false));
        if (method === "ALL") {
          router.add("GET", resPath, compiled);
          router.add("DELETE", resPath, compiled);
          router.add("HEAD", resPath, compiled);
          router.add("OPTIONS", resPath, compiled);
          router.add("PATCH", resPath, compiled);
          router.add("POST", resPath, compiled);
          router.add("PUT", resPath, compiled);
        } else {
          router.add(method, resPath, compiled);
        }
        break;
      }
      case "fsRoute": {
        const items = cmd.getItems();
        const base = mergePath(basePath, cmd.pattern, true);
        applyCommandsInner(root2, router, items, base, onError);
        break;
      }
      default:
        throw new Error(`Unknown command: ${JSON.stringify(cmd)}`);
    }
  }
}
function isFreshFile(mod, commandType) {
  if (mod === null || typeof mod !== "object") return false;
  return typeof mod.default === "function" || commandType === CommandType.Middleware && Array.isArray(mod.default) || typeof mod.config === "object" || typeof mod.handlers === "object" || typeof mod.handlers === "function" || typeof mod.handler === "object" || typeof mod.handler === "function";
}
function fsItemsToCommands(items) {
  const commands = [];
  for (let i2 = 0; i2 < items.length; i2++) {
    const item = items[i2];
    const {
      filePath,
      type,
      mod: rawMod,
      pattern,
      routePattern
    } = item;
    switch (type) {
      case CommandType.Middleware: {
        if (isLazy(rawMod)) continue;
        const {
          handlers: handlers2,
          mod
        } = validateFsMod(filePath, rawMod, type);
        let middlewares = handlers2 ?? mod.default ?? null;
        if (middlewares === null) continue;
        if (isHandlerByMethod(middlewares)) {
          warnInvalidRoute(`Middleware does not support object handlers with GET, POST, etc. in ${filePath}`);
          continue;
        }
        if (!Array.isArray(middlewares)) {
          middlewares = [middlewares];
        }
        commands.push(newMiddlewareCmd(pattern, middlewares, true));
        continue;
      }
      case CommandType.Layout: {
        const {
          handlers: handlers2,
          mod
        } = validateFsMod(filePath, rawMod, type);
        if (handlers2 !== null) {
          warnInvalidRoute("Layout does not support handlers");
        }
        if (!mod.default) continue;
        commands.push(newLayoutCmd(pattern, mod.default, mod.config, true));
        continue;
      }
      case CommandType.Error: {
        const {
          handlers: handlers2,
          mod
        } = validateFsMod(filePath, rawMod, type);
        commands.push(newErrorCmd(pattern, {
          component: mod.default ?? void 0,
          config: mod.config ?? void 0,
          // deno-lint-ignore no-explicit-any
          handler: handlers2 ?? void 0
        }, true));
        continue;
      }
      case CommandType.NotFound: {
        const {
          handlers: handlers2,
          mod
        } = validateFsMod(filePath, rawMod, type);
        commands.push(newNotFoundCmd({
          config: mod.config,
          component: mod.default,
          // deno-lint-ignore no-explicit-any
          handler: handlers2 ?? void 0
        }));
        continue;
      }
      case CommandType.App: {
        const {
          mod
        } = validateFsMod(filePath, rawMod, type);
        if (mod.default === void 0) continue;
        commands.push(newAppCmd(mod.default));
        continue;
      }
      case CommandType.Route: {
        let normalized;
        let config2 = {};
        if (isLazy(rawMod)) {
          normalized = async () => {
            return await tracer.startActiveSpan("lazy-route", {
              attributes: {
                "fresh.route_name": rawMod.name ?? "anonymous"
              }
            }, async (span) => {
              try {
                const result = await rawMod();
                return normalizeRoute(filePath, result, routePattern, type);
              } catch (err) {
                recordSpanError(span, err);
                throw err;
              } finally {
                span.end();
              }
            });
          };
          config2.methods = item.overrideConfig?.methods ?? "ALL";
          config2.routeOverride = item.overrideConfig?.routeOverride ?? routePattern;
        } else {
          normalized = normalizeRoute(filePath, rawMod, routePattern, type);
          if (rawMod.config) {
            config2 = rawMod.config;
          }
        }
        commands.push(newRouteCmd(pattern, normalized, config2, false));
        continue;
      }
      case CommandType.Handler:
        throw new Error(`Not supported`);
      case CommandType.FsRoute:
        throw new Error(`Nested FsRoutes are not supported`);
      default:
        throw new Error(`Unknown command type: ${type}`);
    }
  }
  return commands;
}
function warnInvalidRoute(message) {
  console.warn(`🍋 %c[WARNING] Unsupported route config: ${message}`, "color:rgb(251, 184, 0)");
}
function validateFsMod(filePath, mod, commandType) {
  if (!isFreshFile(mod, commandType)) {
    const hint = commandType === CommandType.Middleware ? `Middleware files must have a default export (function or array of functions).

  Example:
    export default define.middleware(async (ctx) => {
      return await ctx.next();
    });` : `Route files must export a default component, a "handler" or "handlers" export, or a "config" export.

  Example:
    export const handler = define.handlers({ GET(ctx) { ... } });
    export default define.page((props) => <h1>Hello</h1>);`;
    throw new Error(`Could not find relevant exports in: ${filePath}

${hint}`);
  }
  const handlers2 = mod.handlers ?? mod.handler ?? null;
  if (typeof handlers2 === "function" && handlers2.length > 1) {
    throw new Error(`Handlers must only have one argument but found more than one. Check the function signature in: ${filePath}`);
  }
  return {
    handlers: handlers2,
    mod
  };
}
function normalizeRoute(filePath, rawMod, routePattern, commandType) {
  const {
    handlers: handlers2,
    mod
  } = validateFsMod(filePath, rawMod, commandType);
  return {
    config: {
      ...mod.config,
      routeOverride: mod.config?.routeOverride ?? routePattern
    },
    // deno-lint-ignore no-explicit-any
    handler: handlers2 ?? void 0,
    component: mod.default,
    css: rawMod.css
  };
}
class MockBuildCache {
  #files;
  root = "";
  clientEntry = "";
  islandRegistry = /* @__PURE__ */ new Map();
  features = {
    errorOverlay: false
  };
  constructor(files, mode) {
    this.features.errorOverlay = mode === "development";
    this.#files = files;
  }
  getEntryAssets() {
    return [];
  }
  getFsRoutes() {
    return fsItemsToCommands(this.#files);
  }
  readFile(_pathname) {
    return Promise.resolve(null);
  }
}
const DEFAULT_CONN_INFO = {
  localAddr: {
    transport: "tcp",
    hostname: "localhost",
    port: 8080
  },
  remoteAddr: {
    transport: "tcp",
    hostname: "localhost",
    port: 1234
  }
};
const defaultOptionsHandler = (methods) => {
  return () => Promise.resolve(new Response(null, {
    status: 204,
    headers: {
      Allow: methods.join(", ")
    }
  }));
};
const DEFAULT_ERROR_HANDLER = async (ctx) => {
  const {
    error
  } = ctx;
  if (error instanceof HttpError) {
    if (error.status >= 500) {
      console.error(error);
    }
    const message = error.message || STATUS_TEXT$1[error.status];
    return new Response(message, {
      status: error.status
    });
  }
  console.error(error);
  return new Response("Internal server error", {
    status: 500
  });
};
function createOnListen(basePath, options2) {
  return (params) => {
    const pathname = basePath + "/";
    const protocol = "key" in options2 && options2.key && options2.cert ? "https:" : "http:";
    let hostname = params.hostname;
    if (Deno.build.os === "windows" && (hostname === "0.0.0.0" || hostname === "::")) {
      hostname = "localhost";
    }
    hostname = hostname.startsWith("::") ? `[${hostname}]` : hostname;
    console.log();
    console.log(bgRgb8(rgb8(" 🍋 Fresh ready   ", 0), 121));
    const sep = options2.remoteAddress ? "" : "\n";
    const space = options2.remoteAddress ? " " : "";
    const localLabel = bold("Local:");
    const address = cyan(`${protocol}//${hostname}:${params.port}${pathname}`);
    const helper = hostname === "0.0.0.0" || hostname === "::" ? cyan(` (${protocol}//localhost:${params.port}${pathname})`) : "";
    console.log(`    ${localLabel}  ${space}${address}${helper}${sep}`);
    if (options2.remoteAddress) {
      const remoteLabel = bold("Remote:");
      const remoteAddress = cyan(options2.remoteAddress);
      console.log(`    ${remoteLabel}  ${remoteAddress}
`);
    }
  };
}
async function listenOnFreePort(options2, handler2) {
  let firstError = null;
  for (let port = 8e3; port < 8020; port++) {
    try {
      return await Deno.serve({
        ...options2,
        port
      }, handler2);
    } catch (err) {
      if (err instanceof Deno.errors.AddrInUse) {
        if (!firstError) firstError = err;
        continue;
      }
      throw err;
    }
  }
  throw firstError;
}
let setBuildCache;
const NOOP = () => {
};
let App$1 = (_a = class {
  constructor(config2 = {}) {
    __privateAdd(this, _getBuildCache, () => null);
    __privateAdd(this, _commands, []);
    __privateAdd(this, _onError, NOOP);
    /**
     * The final resolved Fresh configuration.
     */
    __publicField(this, "config");
    this.config = {
      root: ".",
      basePath: config2.basePath ?? "",
      mode: config2.mode ?? "production",
      trustProxy: config2.trustProxy ?? false
    };
  }
  use(pathOrMiddleware, ...middlewares) {
    let pattern;
    let fns;
    if (typeof pathOrMiddleware === "string") {
      pattern = pathOrMiddleware;
      fns = middlewares;
    } else {
      pattern = "*";
      middlewares.unshift(pathOrMiddleware);
      fns = middlewares;
    }
    __privateGet(this, _commands).push(newMiddlewareCmd(pattern, fns, true));
    return this;
  }
  /**
   * Set the app's 404 error handler. Can be a {@linkcode Route} or a {@linkcode Middleware}.
   */
  notFound(routeOrMiddleware) {
    __privateGet(this, _commands).push(newNotFoundCmd(routeOrMiddleware));
    return this;
  }
  onError(path, routeOrMiddleware) {
    __privateGet(this, _commands).push(newErrorCmd(path, routeOrMiddleware, true));
    return this;
  }
  appWrapper(component) {
    __privateGet(this, _commands).push(newAppCmd(component));
    return this;
  }
  layout(path, component, config2) {
    __privateGet(this, _commands).push(newLayoutCmd(path, component, config2, true));
    return this;
  }
  route(path, route, config2) {
    __privateGet(this, _commands).push(newRouteCmd(path, route, config2, true));
    return this;
  }
  /**
   * Add middlewares for GET requests at the specified path.
   */
  get(path, ...middlewares) {
    __privateGet(this, _commands).push(newHandlerCmd("GET", path, middlewares, true));
    return this;
  }
  /**
   * Add middlewares for POST requests at the specified path.
   */
  post(path, ...middlewares) {
    __privateGet(this, _commands).push(newHandlerCmd("POST", path, middlewares, true));
    return this;
  }
  /**
   * Add middlewares for PATCH requests at the specified path.
   */
  patch(path, ...middlewares) {
    __privateGet(this, _commands).push(newHandlerCmd("PATCH", path, middlewares, true));
    return this;
  }
  /**
   * Add middlewares for PUT requests at the specified path.
   */
  put(path, ...middlewares) {
    __privateGet(this, _commands).push(newHandlerCmd("PUT", path, middlewares, true));
    return this;
  }
  /**
   * Add middlewares for DELETE requests at the specified path.
   */
  delete(path, ...middlewares) {
    __privateGet(this, _commands).push(newHandlerCmd("DELETE", path, middlewares, true));
    return this;
  }
  /**
   * Add middlewares for HEAD requests at the specified path.
   */
  head(path, ...middlewares) {
    __privateGet(this, _commands).push(newHandlerCmd("HEAD", path, middlewares, true));
    return this;
  }
  /**
   * Register a WebSocket endpoint at the specified path.
   *
   * ```ts
   * app.ws("/chat", {
   *   open(socket) { console.log("connected"); },
   *   message(socket, event) { socket.send(event.data); },
   * });
   * ```
   */
  ws(path, handlers2, options2) {
    return this.get(path, (ctx) => ctx.upgrade(handlers2, options2));
  }
  /**
   * Add middlewares for all HTTP verbs at the specified path.
   */
  all(path, ...middlewares) {
    __privateGet(this, _commands).push(newHandlerCmd("ALL", path, middlewares, true));
    return this;
  }
  /**
   * Insert file routes collected in {@linkcode Builder} at this point.
   * @param pattern Append file routes at this pattern instead of the root
   * @returns
   */
  fsRoutes(pattern = "*") {
    __privateGet(this, _commands).push({
      type: CommandType.FsRoute,
      pattern,
      getItems: () => {
        const buildCache = __privateGet(this, _getBuildCache).call(this);
        if (buildCache === null) return [];
        return buildCache.getFsRoutes();
      },
      includeLastSegment: false
    });
    return this;
  }
  /**
   * Merge another {@linkcode App} instance into this app at the
   * specified path.
   */
  mountApp(path, app2) {
    for (let i2 = 0; i2 < __privateGet(app2, _commands).length; i2++) {
      const cmd = __privateGet(app2, _commands)[i2];
      if (cmd.type !== CommandType.App && cmd.type !== CommandType.NotFound) {
        let effectivePattern = cmd.pattern;
        if (app2.config.basePath) {
          effectivePattern = mergePath(app2.config.basePath, cmd.pattern, false);
        }
        const clone = {
          ...cmd,
          pattern: mergePath(path, effectivePattern, true),
          includeLastSegment: cmd.pattern === "/" || cmd.includeLastSegment
        };
        __privateGet(this, _commands).push(clone);
        continue;
      }
      __privateGet(this, _commands).push(cmd);
    }
    const self2 = this;
    __privateSet(app2, _getBuildCache, () => {
      var _a2;
      return __privateGet(_a2 = self2, _getBuildCache).call(_a2);
    });
    return this;
  }
  /**
   * Create handler function for `Deno.serve` or to be used in
   * testing.
   */
  handler() {
    let buildCache = __privateGet(this, _getBuildCache).call(this);
    if (buildCache === null) {
      if (this.config.mode === "production" && DENO_DEPLOYMENT_ID$1 !== void 0) ;
      else {
        buildCache = new MockBuildCache([], this.config.mode);
      }
    }
    const router = new UrlPatternRouter();
    const {
      rootHandler
    } = applyCommands(router, __privateGet(this, _commands), this.config.basePath, __privateGet(this, _onError));
    const trustProxy = this.config.trustProxy;
    return async (req, conn = DEFAULT_CONN_INFO) => {
      const url = new URL(req.url);
      url.pathname = url.pathname.replace(/\/+/g, "/");
      if (trustProxy) {
        const proto = req.headers.get("x-forwarded-proto");
        if (proto) {
          url.protocol = proto + ":";
        }
        const host = req.headers.get("x-forwarded-host");
        if (host) {
          url.host = host;
        }
      }
      const method = req.method.toUpperCase();
      const matched = router.match(method, url);
      let {
        params,
        pattern,
        item: handler2,
        methodMatch
      } = matched;
      const span = _trace.getActiveSpan();
      if (span && pattern) {
        span.updateName(`${method} ${pattern}`);
        span.setAttribute("http.route", pattern);
      }
      let next;
      if (pattern === null || !methodMatch) {
        handler2 = rootHandler;
      }
      if (matched.pattern !== null && !methodMatch) {
        if (method === "OPTIONS") {
          const allowed = router.getAllowedMethods(matched.pattern);
          next = defaultOptionsHandler(allowed);
        } else {
          next = DEFAULT_NOT_ALLOWED_METHOD;
        }
      } else {
        next = DEFAULT_NOT_FOUND;
      }
      const ctx = new Context(req, url, conn, matched.pattern, params, this.config, next, buildCache);
      try {
        const result = await (handler2 !== null ? handler2(ctx) : next());
        if (!(result instanceof Response)) {
          throw new Error(`Expected a "Response" instance to be returned, but got: ${result}`);
        }
        if (method === "HEAD") {
          return new Response(null, result);
        }
        return result;
      } catch (err) {
        ctx.error = err;
        return await DEFAULT_ERROR_HANDLER(ctx);
      }
    };
  }
  /**
   * Spawn a server for this app.
   */
  async listen(options2 = {}) {
    if (!options2.onListen) {
      options2.onListen = createOnListen(this.config.basePath, options2);
    }
    const handler2 = this.handler();
    if (options2.port) {
      await Deno.serve(options2, handler2);
      return;
    }
    await listenOnFreePort(options2, handler2);
  }
}, _getBuildCache = new WeakMap(), _commands = new WeakMap(), _onError = new WeakMap(), setBuildCache = (app2, cache2, mode) => {
  app2.config.root = cache2.root;
  app2.config.mode = mode;
  __privateSet(app2, _getBuildCache, () => cache2);
}, _a);
class ProdBuildCache {
  root;
  #snapshot;
  islandRegistry;
  clientEntry;
  features;
  constructor(root2, snapshot2) {
    this.root = root2;
    this.features = {
      errorOverlay: false
    };
    setBuildId(snapshot2.version);
    this.#snapshot = snapshot2;
    this.islandRegistry = snapshot2.islands;
    this.clientEntry = snapshot2.clientEntry;
  }
  getEntryAssets() {
    return this.#snapshot.entryAssets;
  }
  getFsRoutes() {
    return fsItemsToCommands(this.#snapshot.fsRoutes);
  }
  async readFile(pathname) {
    const {
      staticFiles: staticFiles2
    } = this.#snapshot;
    const info = staticFiles2.get(pathname);
    if (info === void 0) return null;
    const filePath = isAbsolute(info.filePath) ? info.filePath : join$3(this.root, info.filePath);
    const [stat, file] = await Promise.all([Deno.stat(filePath), Deno.open(filePath)]);
    return {
      hash: info.hash,
      contentType: info.contentType,
      size: stat.size,
      readable: file.readable,
      close: () => file.close(),
      immutable: info.immutable
    };
  }
}
class IslandPreparer {
  #namer = new UniqueNamer();
  prepare(registry, mod, chunkName, modName, css2) {
    for (const [name, value] of Object.entries(mod)) {
      if (typeof value !== "function") continue;
      const islandName = name === "default" ? modName : name;
      const uniqueName = this.#namer.getUniqueName(islandName);
      const fn = value;
      registry.set(fn, {
        exportName: name,
        file: chunkName,
        fn,
        name: uniqueName,
        css: css2
      });
    }
  }
}
function useElementSize(ref) {
  const [size, setSize] = d$1(null);
  h$1(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      const width = Math.round(entry.contentRect.width);
      const height = Math.round(entry.contentRect.height);
      setSize((current) => current?.width === width && current.height === height ? current : {
        width,
        height
      });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return size;
}
const REFRACTIVE_INDEX = 1.5;
const THICKNESS = 0.6;
const BACKDROP_GAP = 0.6;
const SAMPLES = 128;
const LIGHT_ANGLE = -60 * Math.PI / 180;
const RIM_WIDTH = 1.5;
const NEUTRAL = [128, 128, 128, 255];
const CLEAR = [255, 255, 255, 0];
const cache = /* @__PURE__ */ new Map();
function surface(x2) {
  return Math.pow(1 - Math.pow(1 - x2, 4), 1 / 4);
}
function refractionProfile(bezel) {
  const delta = 1e-3;
  return Array.from({
    length: SAMPLES
  }, (_2, index) => {
    const x2 = Math.min(Math.max(index / (SAMPLES - 1), delta), 1 - delta);
    const slope = (surface(x2 + delta) - surface(x2 - delta)) / (2 * delta);
    const incidence = Math.atan(slope * THICKNESS);
    const refracted = Math.asin(Math.sin(incidence) / REFRACTIVE_INDEX);
    const depth = (surface(x2) * THICKNESS + BACKDROP_GAP) * bezel;
    return depth * Math.tan(incidence - refracted);
  });
}
function rectEdge(x2, y2, rect) {
  const {
    width,
    height,
    radius
  } = rect;
  const cx = x2 - rect.x - width / 2;
  const cy = y2 - rect.y - height / 2;
  const qx = Math.abs(cx) - (width / 2 - radius);
  const qy = Math.abs(cy) - (height / 2 - radius);
  const sx = Math.sign(cx) || 1;
  const sy = Math.sign(cy) || 1;
  if (qx > 0 && qy > 0) {
    const length = Math.hypot(qx, qy);
    return [radius - length, qx / length * sx, qy / length * sy];
  }
  return qx > qy ? [radius - qx, sx, 0] : [radius - qy, 0, sy];
}
function edge(x2, y2, shape) {
  const {
    width,
    height,
    radius,
    arm
  } = shape;
  if (!arm) return rectEdge(x2, y2, {
    x: 0,
    y: 0,
    width,
    height,
    radius
  });
  const horizontal = rectEdge(x2, y2, {
    x: 0,
    y: (height - arm) / 2,
    width,
    height: arm,
    radius
  });
  const vertical = rectEdge(x2, y2, {
    x: (width - arm) / 2,
    y: 0,
    width: arm,
    height,
    radius
  });
  return horizontal[0] > vertical[0] ? horizontal : vertical;
}
function paint(width, height, density, pixel) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(width * density);
  canvas.height = Math.ceil(height * density);
  const context = canvas.getContext("2d");
  const image = context.createImageData(canvas.width, canvas.height);
  for (let y2 = 0; y2 < canvas.height; y2++) {
    for (let x2 = 0; x2 < canvas.width; x2++) {
      image.data.set(pixel((x2 + 0.5) / density, (y2 + 0.5) / density), (y2 * canvas.width + x2) * 4);
    }
  }
  context.putImageData(image, 0, 0);
  return canvas.toDataURL();
}
function crossPath(width, height, arm, radius) {
  const x2 = (width - arm) / 2;
  const y2 = (height - arm) / 2;
  const r2 = `A ${radius} ${radius} 0 0 1`;
  return [`M ${x2 + radius} 0 H ${x2 + arm - radius} ${r2} ${x2 + arm} ${radius}`, `V ${y2} H ${width - radius} ${r2} ${width} ${y2 + radius}`, `V ${y2 + arm - radius} ${r2} ${width - radius} ${y2 + arm}`, `H ${x2 + arm} V ${height - radius} ${r2} ${x2 + arm - radius} ${height}`, `H ${x2 + radius} ${r2} ${x2} ${height - radius} V ${y2 + arm}`, `H ${radius} ${r2} 0 ${y2 + arm - radius} V ${y2 + radius} ${r2} ${radius} ${y2}`, `H ${x2} V ${radius} ${r2} ${x2 + radius} 0 Z`].join(" ");
}
function createGlassMaps(input) {
  const thickness = input.arm ?? Math.min(input.width, input.height);
  const radius = Math.min(input.radius, thickness / 2);
  const bezel = Math.min(input.bezel, thickness / 2);
  const shape = {
    ...input,
    radius,
    bezel
  };
  const density = Math.min(self.devicePixelRatio || 1, 2);
  const key = [shape.width, shape.height, radius, bezel, shape.arm, density].join();
  const cached = cache.get(key);
  if (cached) return cached;
  const profile = refractionProfile(shape.bezel);
  const peak = Math.max(...profile.map(Math.abs)) || 1;
  const lightX = Math.cos(LIGHT_ANGLE);
  const lightY = Math.sin(LIGHT_ANGLE);
  const displacement = paint(shape.width, shape.height, 1, (x2, y2) => {
    const [distance, nx, ny] = edge(x2, y2, shape);
    if (distance <= 0 || distance >= shape.bezel) return NEUTRAL;
    const index = Math.round(distance / shape.bezel * (SAMPLES - 1));
    const magnitude = profile[index] / peak * 127;
    return [128 - nx * magnitude, 128 - ny * magnitude, 128, 255];
  });
  const specular = paint(shape.width, shape.height, density, (x2, y2) => {
    const [distance, nx, ny] = edge(x2, y2, shape);
    if (distance <= 0 || distance >= shape.bezel) return CLEAR;
    const facing = Math.abs(nx * lightX + ny * lightY);
    const rim = Math.max(0, 1 - distance / RIM_WIDTH);
    const glow = Math.pow(1 - distance / shape.bezel, 3) * 0.35;
    const alpha = Math.min(1, (rim * 0.9 + glow) * (0.25 + facing * 0.75));
    return [255, 255, 255, Math.round(alpha * 255)];
  });
  const maps = {
    displacement,
    specular,
    scale: peak * 2
  };
  cache.set(key, maps);
  return maps;
}
function supportsRefraction() {
  return typeof navigator !== "undefined" && "userAgentData" in navigator;
}
const $$_tpl_1$z = ["<div ", " ", " ", ">", "<div ", " ", '></div><div class="glass-layer glass-tint"></div><div class="glass-layer glass-specular" ', '></div><div class="glass-content">', "</div>", "</div>"];
const $$_tpl_2$8 = ['<svg class="glass-silhouette"><path ', "></path></svg>"];
const $$_tpl_3$7 = ['<svg class="absolute w-0 h-0" color-interpolation-filters="sRGB"><filter ', '><feGaussianBlur in="SourceGraphic" ', ' edgeMode="duplicate" result="blurred"></feGaussianBlur><feImage ', ' x="0" y="0" ', " ", ' preserveAspectRatio="none" result="map"></feImage><feDisplacementMap in="blurred" in2="map" ', ' xChannelSelector="R" yChannelSelector="G" result="refracted"></feDisplacementMap><feColorMatrix in="refracted" type="saturate" values="1.6"></feColorMatrix></filter></svg>'];
function Glass({
  radius,
  bezel = 16,
  blur = 1.5,
  arm,
  class: classes = "",
  children
}) {
  const id = `glass-${g$1().replace(/[^\w-]/g, "")}`;
  const ref = A$1(null);
  const size = useElementSize(ref);
  const [refraction, setRefraction] = d$1(false);
  h$1(() => setRefraction(supportsRefraction()), []);
  const maps = size?.width && size.height ? createGlassMaps({
    ...size,
    radius,
    bezel,
    arm
  }) : null;
  const refracting = refraction && size && maps;
  const outline = arm && size ? crossPath(size.width, size.height, arm, radius) : null;
  return a$2($$_tpl_1$z, l$2("ref", ref), l$2("class", `glass ${outline ? "glass-outlined" : ""} ${classes}`), l$2("style", {
    borderRadius: `${radius}px`,
    "--glass-clip": outline ? `path("${outline}")` : void 0
  }), s$2(outline && a$2($$_tpl_2$8, l$2("d", outline))), l$2("class", `glass-layer ${refracting ? "" : "glass-frost"}`), l$2("style", refracting ? {
    backdropFilter: `url(#${id})`
  } : void 0), l$2("style", maps ? {
    backgroundImage: `url(${maps.specular})`
  } : void 0), s$2(children), s$2(refracting && a$2($$_tpl_3$7, l$2("id", id), l$2("stdDeviation", blur), l$2("href", maps.displacement), l$2("width", size.width), l$2("height", size.height), l$2("scale", maps.scale))));
}
const $$_tpl_2$7 = ['<div class="flex items-center gap-0.5 p-1.5">', "</div>"];
const $$_tpl_1$y = ['<div class="relative shrink-0 max-w-full" ', " ", " ", ">", "", "</div>"];
const $$_tpl_4$4 = ['<p role="status" class="px-4 py-2 text-[14px] font-medium">', "</p>"];
const $$_tpl_3$6 = ["<div ", " ", ">", "</div>"];
const $$_tpl_5$4 = ['<button type="button" class="grid place-items-center w-10 h-10 shrink-0 rounded-full hover:bg-[var(--fill)]" ', " ", " ", ">", "</button>"];
const $$_tpl_6$4 = ['<div class="w-px h-5 mx-1 shrink-0 bg-[var(--separator)]"></div>'];
const DOCK_RADIUS = 20;
const stopKey = (event) => {
  if (event.target.matches(":focus-visible")) {
    event.stopPropagation();
  }
};
function Dock({
  children,
  notice,
  showNotice
}) {
  return a$2($$_tpl_1$y, l$2("onkeydown", stopKey), l$2("onkeyup", stopKey), l$2("onkeypress", stopKey), u$2(Toast, {
    notice,
    visible: showNotice
  }), u$2(Glass, {
    radius: DOCK_RADIUS,
    bezel: 18,
    children: a$2($$_tpl_2$7, s$2(children))
  }));
}
function Toast({
  notice,
  visible,
  side = "above"
}) {
  return a$2($$_tpl_3$6, l$2("class", `toast toast-${side}`), l$2("data-open", visible || void 0), u$2(Glass, {
    radius: 18,
    bezel: 12,
    blur: 14,
    children: a$2($$_tpl_4$4, s$2(notice))
  }));
}
function DockButton({
  label,
  onClick,
  children
}) {
  return a$2($$_tpl_5$4, l$2("aria-label", label), l$2("title", label), l$2("onclick", onClick), s$2(children));
}
function DockDivider() {
  return a$2($$_tpl_6$4);
}
function useDismiss(open, close, refs) {
  h$1(() => {
    if (!open) return;
    const onPointerDown = (event) => {
      const target = event.target;
      if (!refs.some((ref) => ref.current?.contains(target))) close();
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [open, close]);
}
const GAME_LIBRARY = ["asteroids.gb", "batman.gb", "contra.gb", "donkey-kong.gb", "dr-mario-dx.gb", "dr-mario.gb", "galaga-dx.gb", "kirby-dream-2-dx.gb", "kirby-dream-2.gb", "kirby-dream-dx.gb", "kirby-dream.gb", "kirby-tilt-n-tumble.gbc", "megaman-v-dx.gb", "megaman-willy.gb", "metal-gear-solid.gbc", "pokemon-crystal.gbc", "pokemon-gold.gbc", "pokemon-silver.gbc", "pokemon-yellow.gb", "super-mario-deluxe.gbc", "super-mario.gb", "tetris-dx.gb", "tetris.gb", "trip-world.gb", "wario-land-3.gbc", "zelda-dx.gbc", "zelda-oracle-of-ages.gbc", "zelda.gb"];
function isValidGame(game) {
  return GAME_LIBRARY.includes(game);
}
function normalizeGameName(game) {
  const validExtensions = [".gb", ".gbc"];
  if (validExtensions.some((ext) => game.endsWith(ext))) {
    return game;
  }
  const candidates = [`${game}.gbc`, `${game}.gb`];
  for (const candidate of candidates) {
    if (isValidGame(candidate)) return candidate;
  }
  return game;
}
function getGameFromUrl() {
  if (typeof self === "undefined" || !self.location) return null;
  const urlParams = new URLSearchParams(self.location.search);
  const requestedGame = urlParams.get("game");
  if (!requestedGame) return null;
  const normalizedGame = normalizeGameName(requestedGame);
  return isValidGame(normalizedGame) ? normalizedGame : null;
}
function getRandomGame() {
  return GAME_LIBRARY[Math.floor(Math.random() * GAME_LIBRARY.length)];
}
function getGameToLoad() {
  return getGameFromUrl() ?? getRandomGame();
}
function getCurrentGame() {
  return getGameFromUrl();
}
async function fetchRom(game) {
  const response = await fetch(`/roms/${game}`);
  if (!response.ok) throw new Error(`Failed to fetch ${game}`);
  return new Uint8Array(await response.arrayBuffer());
}
const GAME_TITLES = {
  "asteroids.gb": "Asteroids",
  "batman.gb": "Batman",
  "contra.gb": "Contra: The Alien Wars",
  "donkey-kong.gb": "Donkey Kong",
  "dr-mario-dx.gb": "Dr. Mario DX",
  "dr-mario.gb": "Dr. Mario",
  "galaga-dx.gb": "Galaga DX",
  "kirby-dream-2-dx.gb": "Kirby's Dream Land 2 DX",
  "kirby-dream-2.gb": "Kirby's Dream Land 2",
  "kirby-dream-dx.gb": "Kirby's Dream Land DX",
  "kirby-dream.gb": "Kirby's Dream Land",
  "kirby-tilt-n-tumble.gbc": "Kirby Tilt 'n' Tumble",
  "megaman-v-dx.gb": "Mega Man V DX",
  "megaman-willy.gb": "Mega Man: Dr. Wily's Revenge",
  "metal-gear-solid.gbc": "Metal Gear Solid",
  "pokemon-crystal.gbc": "Pokémon Crystal",
  "pokemon-gold.gbc": "Pokémon Gold",
  "pokemon-silver.gbc": "Pokémon Silver",
  "pokemon-yellow.gb": "Pokémon Yellow",
  "super-mario-deluxe.gbc": "Super Mario Bros. Deluxe",
  "super-mario.gb": "Super Mario Land",
  "tetris-dx.gb": "Tetris DX",
  "tetris.gb": "Tetris",
  "trip-world.gb": "Trip World",
  "wario-land-3.gbc": "Wario Land 3",
  "zelda-dx.gbc": "Link's Awakening DX",
  "zelda-oracle-of-ages.gbc": "Oracle of Ages",
  "zelda.gb": "Link's Awakening"
};
function formatGameName(game) {
  if (isValidGame(game)) return GAME_TITLES[game];
  return game.replace(/\.gb[c]?$/, "").split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}
const GAME_OPTIONS = GAME_LIBRARY.map((game) => ({
  value: game,
  label: formatGameName(game)
})).sort((a2, b2) => a2.label.localeCompare(b2.label));
const $$_tpl_1$x = ['<path stroke-linecap="round" stroke-linejoin="round" d="M5 12.5l4.5 4.5L19 7.5"></path>'];
function CheckIcon(props) {
  return u$2("svg", {
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2.5",
    viewBox: "0 0 24 24",
    ...props,
    children: a$2($$_tpl_1$x)
  });
}
const $$_tpl_1$w = ['<path stroke-linecap="round" stroke-linejoin="round" d="M8 9l4-4 4 4m-8 6l4 4 4-4"></path>'];
function ChevronUpDownIcon(props) {
  return u$2("svg", {
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    viewBox: "0 0 24 24",
    ...props,
    children: a$2($$_tpl_1$w)
  });
}
const $$_tpl_1$v = ['<path stroke-linecap="round" stroke-linejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7zm9 9v-5m-2.5 2.5L12 11l2.5 2.5"></path>'];
function LoadRomIcon(props) {
  return u$2("svg", {
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    viewBox: "0 0 24 24",
    ...props,
    children: a$2($$_tpl_1$v)
  });
}
const $$_tpl_1$u = ['<path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-6.22-8.56"></path>'];
function SpinnerIcon(props) {
  return u$2("svg", {
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    viewBox: "0 0 24 24",
    ...props,
    children: a$2($$_tpl_1$u)
  });
}
const $$_tpl_1$t = ["<div ", " ", " ", " ", ">", "</div>"];
const POPOVER_RADIUS = 22;
function Popover({
  open,
  align,
  side = "above",
  panelRef,
  class: classes,
  children
}) {
  const vertical = side === "above" ? "bottom" : "top";
  return a$2($$_tpl_1$t, l$2("ref", panelRef), l$2("class", `popover popover-${side} ${align === "start" ? `left-0 origin-${vertical}-left` : `right-0 origin-${vertical}-right`}`), l$2("data-open", open || void 0), !open ? "inert" : "", u$2(Glass, {
    radius: POPOVER_RADIUS,
    bezel: 20,
    blur: 14,
    class: classes,
    children
  }));
}
const $$_tpl_2$6 = ["<ul ", ' role="listbox" aria-label="Games" class="max-h-[min(24rem,55dvh)] overflow-y-auto overscroll-contain p-1.5 scroll-py-1.5">', "</ul>"];
const $$_tpl_1$s = ["<button ", ' type="button" role="combobox" aria-label="Game" aria-haspopup="listbox" ', " ", " ", " ", ' class="flex items-center gap-1.5 h-10 pl-4 pr-3 rounded-full min-w-0 text-[15px] font-semibold tracking-[-0.01em] hover:bg-[var(--fill)] aria-expanded:bg-[var(--fill)]" ', " ", '><span class="truncate max-w-[8.5rem] sm:max-w-[13rem]">', "</span>", "</button>", "<input ", ' type="file" accept=".gb,.gbc" class="hidden" ', ">"];
const $$_tpl_3$5 = ["<li ", " ", ' role="option" ', " ", " ", " ", " ", '><span class="w-5 flex justify-center shrink-0">', '</span><span class="truncate">', "</span></li>"];
const LOAD_ROM = "load-rom";
const LIST_ID = "game-list";
const PAGE_SIZE = 8;
const TYPEAHEAD_RESET_MS = 600;
const optionId = (index) => `${LIST_ID}-${index}`;
function GameSelector({
  currentGame,
  pendingGame,
  onGameChange,
  onRomFile,
  open,
  onOpenChange
}) {
  const triggerRef = A$1(null);
  const panelRef = A$1(null);
  const fileInput = A$1(null);
  const typeahead = A$1({
    query: "",
    time: 0
  });
  const options2 = T(() => [...!currentGame || isValidGame(currentGame) ? [] : [{
    value: currentGame,
    label: formatGameName(currentGame)
  }], ...GAME_OPTIONS, {
    value: LOAD_ROM,
    label: "Open a ROM file…"
  }], [currentGame]);
  const selected = options2.findIndex((option) => option.value === currentGame);
  const [active, setActive] = d$1(Math.max(0, selected));
  const loading = !!pendingGame || !currentGame;
  const title = pendingGame ?? currentGame;
  const close = () => onOpenChange(false);
  useDismiss(open, close, [triggerRef, panelRef]);
  h$1(() => {
    if (open) setActive(Math.max(0, selected));
  }, [open]);
  h$1(() => {
    if (open) {
      document.getElementById(optionId(active))?.scrollIntoView({
        block: "nearest"
      });
    }
  }, [open, active]);
  const choose = (index) => {
    const {
      value
    } = options2[index];
    close();
    if (value === LOAD_ROM) {
      fileInput.current?.click();
      return;
    }
    if (value !== currentGame) onGameChange(value);
    document.getElementById("canvas")?.focus();
  };
  const findByPrefix = (key) => {
    const now = performance.now();
    const state = typeahead.current;
    state.query = now - state.time > TYPEAHEAD_RESET_MS ? key : state.query + key;
    state.time = now;
    const query = state.query.toLowerCase();
    const start = state.query.length === 1 ? active + 1 : active;
    const ordered = [...options2.slice(start), ...options2.slice(0, start)];
    const match = ordered.find((option) => option.label.toLowerCase().startsWith(query));
    return match ? options2.indexOf(match) : -1;
  };
  const onKeyDown = (event) => {
    const trigger = event.currentTarget;
    if (!open && !trigger.matches(":focus-visible")) return;
    event.stopPropagation();
    const last = options2.length - 1;
    const move = (index) => {
      event.preventDefault();
      if (!open) onOpenChange(true);
      setActive(Math.min(last, Math.max(0, index)));
    };
    if (event.key.length === 1 && event.key !== " " && !event.metaKey) {
      const match = findByPrefix(event.key);
      if (match >= 0) move(match);
      return;
    }
    switch (event.key) {
      case "ArrowDown":
        return move(open ? active + 1 : selected);
      case "ArrowUp":
        return move(open ? active - 1 : selected);
      case "Home":
        return move(0);
      case "End":
        return move(last);
      case "PageDown":
        return move(active + PAGE_SIZE);
      case "PageUp":
        return move(active - PAGE_SIZE);
      case "Enter":
      case " ":
        event.preventDefault();
        return open ? choose(active) : onOpenChange(true);
      case "Tab":
        if (open) close();
    }
  };
  const handleFile = (event) => {
    const input = event.target;
    const file = input.files?.[0];
    if (file) onRomFile(file);
    input.value = "";
  };
  const loadRomIndex = options2.length - 1;
  return a$2($$_tpl_1$s, l$2("ref", triggerRef), l$2("aria-expanded", open), l$2("aria-controls", LIST_ID), l$2("aria-activedescendant", open ? optionId(active) : void 0), l$2("aria-busy", loading), l$2("onclick", () => {
    triggerRef.current?.focus({
      preventScroll: true
    });
    onOpenChange(!open);
  }), l$2("onkeydown", onKeyDown), s$2(title ? formatGameName(title) : "Loading…"), s$2(loading ? u$2(SpinnerIcon, {
    class: "w-3.5 h-3.5 shrink-0 text-[var(--label-secondary)] motion-safe:animate-spin"
  }) : u$2(ChevronUpDownIcon, {
    class: "w-3.5 h-3.5 shrink-0 text-[var(--label-secondary)]"
  })), u$2(Popover, {
    open,
    align: "start",
    panelRef,
    class: "w-[min(18rem,calc(100vw-2rem))]",
    children: a$2($$_tpl_2$6, l$2("id", LIST_ID), s$2(options2.map((option, index) => a$2($$_tpl_3$5, l$2("key", option.value), l$2("id", optionId(index)), l$2("aria-selected", index === selected), l$2("data-active", index === active || void 0), l$2("class", `flex items-center gap-2 h-9 pl-2 pr-3 rounded-2xl cursor-default select-none text-[15px] data-active:bg-[var(--fill-strong)] ${index === loadRomIndex ? "mt-1.5 relative before:absolute before:-top-1 before:inset-x-3 before:h-px before:bg-[var(--separator)]" : ""}`), l$2("onpointermove", () => setActive(index)), l$2("onclick", () => choose(index)), s$2(index === loadRomIndex ? u$2(LoadRomIcon, {
      class: "w-4 h-4"
    }) : index === selected && u$2(CheckIcon, {
      class: "w-4 h-4"
    })), s$2(option.label)))))
  }), l$2("ref", fileInput), l$2("onchange", handleFile));
}
const CANVAS_DIMENSIONS = {
  gameScreenWidth: 320,
  panelWidth: 256,
  canvasWidth: 576,
  canvasHeight: 288
};
const DEFAULT_VOLUME = 0.7;
const STORAGE_KEYS = {
  scale: "gb-scale",
  volume: "gb-volume",
  theme: "gb-theme",
  tiles: "gb-tiles",
  palette: "gb-palette",
  colorCorrection: "gb-color-correction",
  handheld: "gb-handheld"
};
function drawFrame(source, target) {
  const context = target.getContext("2d", {
    willReadFrequently: true
  });
  const width = source.width * CANVAS_DIMENSIONS.gameScreenWidth / CANVAS_DIMENSIONS.canvasWidth;
  context.imageSmoothingEnabled = false;
  context.drawImage(source, 0, 0, width, source.height, 0, 0, target.width, target.height);
  return context;
}
const $$_tpl_1$r = ["<canvas ", " ", " ", ' class="ambient"></canvas>'];
const $$_tpl_2$5 = ['<span class="speaker-grille"></span>'];
const $$_tpl_3$4 = ['<div class="speaker-slots">', "</div>"];
const $$_tpl_4$3 = ["<span ", ' class="speaker-slot"></span>'];
const $$_tpl_6$3 = ["<span></span>"];
const $$_tpl_5$3 = ['<div class="case-surround" aria-hidden="true"><div class="case case-glass">', '<span class="case-tint"></span>', "", "</div></div>"];
const $$_tpl_7$3 = ['<div class="case-surround" aria-hidden="true"><div ', ">", "", "</div></div>"];
const $$_tpl_8$2 = ['<span class="case-groove"></span>'];
const $$_tpl_9$2 = ['<div class="relative z-20 flex items-center justify-between w-full h-9 px-1 mb-2 shrink-0">', "", "</div>"];
const $$_tpl_10$2 = ['<span class="power-switch">◁OFF•ON▷</span>'];
const $$_tpl_11$1 = ["<span></span>"];
const $$_tpl_12$1 = ['<span class="power-light"><span class="flex items-center gap-[2px]"><span class="led"></span><span class="led-wave"></span><span class="led-wave"></span><span class="led-wave"></span></span>POWER</span>'];
const $$_tpl_13 = ['<div class="bezel-title"><span class="bezel-stripes flex-1"></span><span>DOT MATRIX WITH STEREO SOUND</span><span class="bezel-stripes w-4"></span></div><span class="battery-light"><span class="led"></span>BATTERY</span>'];
const $$_tpl_14 = ['<p class="bezel-logo"><span class="logo-wordmark text-[#dfe2e8]">GAME BOY</span><span class="logo-color">', "</span></p>"];
const $$_tpl_15 = ["<span ", " ", " ", ">", "</span>"];
const $$_tpl_16 = ['<p class="brand-dmg logo-wordmark" ', '>GAME BOY<span class="text-[8px] not-italic ml-0.5">TM</span></p>'];
const HANDHELD_INSET = {
  width: 72,
  height: 150
};
const AMBIENT_WIDTH = 32;
const AMBIENT_HEIGHT = 29;
const SPEAKER_SLOTS = 6;
const GLASS_RADIUS = 44;
const COLOR_LETTERS = [{
  letter: "C",
  color: "#e5484d",
  tilt: -10,
  small: false
}, {
  letter: "o",
  color: "#9b5fc0",
  tilt: 8,
  small: true
}, {
  letter: "L",
  color: "#5bb74a",
  tilt: -6,
  small: false
}, {
  letter: "o",
  color: "#f2c318",
  tilt: 10,
  small: true
}, {
  letter: "R",
  color: "#3d86d6",
  tilt: -4,
  small: false
}];
function Ambient({
  canvasRef
}) {
  const ref = A$1(null);
  h$1(() => {
    let request = 0;
    const draw = () => {
      request = requestAnimationFrame(draw);
      const source = canvasRef.current;
      if (source?.width && source.height && ref.current) {
        drawFrame(source, ref.current);
      }
    };
    request = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(request);
  }, [canvasRef]);
  return a$2($$_tpl_1$r, l$2("ref", ref), l$2("width", AMBIENT_WIDTH), l$2("height", AMBIENT_HEIGHT));
}
function Speaker({
  preset
}) {
  if (preset?.model !== "dmg") return a$2($$_tpl_2$5);
  return a$2($$_tpl_3$4, s$2(Array.from({
    length: SPEAKER_SLOTS
  }, (_2, index) => a$2($$_tpl_4$3, l$2("key", index)))));
}
function CaseBackdrop({
  preset,
  canvasRef
}) {
  if (!preset) {
    return a$2($$_tpl_5$3, u$2(Ambient, {
      canvasRef
    }), u$2(Glass, {
      radius: GLASS_RADIUS,
      bezel: 30,
      blur: 18,
      class: "absolute inset-0",
      children: a$2($$_tpl_6$3)
    }), u$2(Speaker, {
      preset
    }));
  }
  return a$2($$_tpl_7$3, l$2("class", `case case-plastic case-${preset.model} ${preset.translucent ? "case-clear" : ""}`), s$2(preset.model === "dmg" && a$2($$_tpl_8$2)), u$2(Speaker, {
    preset
  }));
}
function CaseHeader({
  preset,
  children
}) {
  return a$2($$_tpl_9$2, s$2(preset?.model === "dmg" ? a$2($$_tpl_10$2) : a$2($$_tpl_11$1)), s$2(children));
}
function bezelClass(preset) {
  if (!preset) return "bezel bezel-glass";
  return preset.model === "dmg" ? "bezel bezel-dmg" : "bezel bezel-gbc";
}
function BezelHeader({
  preset
}) {
  if (preset?.model !== "dmg") {
    return a$2($$_tpl_12$1);
  }
  return a$2($$_tpl_13);
}
function BezelFooter({
  preset
}) {
  if (preset?.model === "dmg") return null;
  return a$2($$_tpl_14, s$2(COLOR_LETTERS.map(({
    letter,
    color,
    tilt,
    small
  }, index) => a$2($$_tpl_15, l$2("key", index), l$2("class", small ? "text-[12px]" : "text-[16px]"), l$2("style", {
    color,
    transform: `rotate(${tilt}deg)`
  }), s$2(letter)))));
}
function Branding({
  preset
}) {
  if (preset?.model !== "dmg") return null;
  return a$2($$_tpl_16, l$2("style", {
    color: preset.ink
  }));
}
const SURROUND = [17, 17, 19];
const CASES = [{
  id: "classic",
  name: "Classic",
  model: "dmg",
  body: [188, 184, 182],
  ink: "#303a93",
  buttons: "#862a58",
  dpad: "#27272a",
  rubber: "#787377"
}, {
  id: "berry",
  name: "Berry",
  model: "gbc",
  body: [214, 36, 95],
  ink: "#5e0c2b",
  buttons: "#313335",
  dpad: "#313335",
  rubber: "#3b3b40"
}, {
  id: "grape",
  name: "Grape",
  model: "gbc",
  body: [92, 46, 140],
  ink: "#1f0d3a",
  buttons: "#313335",
  dpad: "#313335",
  rubber: "#3b3b40"
}, {
  id: "kiwi",
  name: "Kiwi",
  model: "gbc",
  body: [170, 211, 63],
  ink: "#3e5510",
  buttons: "#313335",
  dpad: "#313335",
  rubber: "#3b3b40"
}, {
  id: "dandelion",
  name: "Dandelion",
  model: "gbc",
  body: [246, 207, 29],
  ink: "#6b5200",
  buttons: "#313335",
  dpad: "#313335",
  rubber: "#3b3b40"
}, {
  id: "teal",
  name: "Teal",
  model: "gbc",
  body: [30, 159, 196],
  ink: "#0a4252",
  buttons: "#313335",
  dpad: "#313335",
  rubber: "#3b3b40"
}, {
  id: "atomic",
  name: "Atomic Purple",
  model: "gbc",
  body: [111, 85, 168],
  ink: "#1f0d3a",
  buttons: "#3a2a5c",
  dpad: "#3a2a5c",
  rubber: "#6d6480",
  translucent: true
}];
const DYNAMIC_CONTROLS = {
  id: "dynamic",
  name: "Dynamic",
  model: "gbc",
  body: [0, 0, 0],
  ink: "var(--accent)",
  buttons: "var(--accent)",
  dpad: "var(--accent)",
  rubber: "var(--accent)"
};
const CASE_IDS = [...CASES.map(({
  id
}) => id), "dynamic"];
function findCase(id) {
  return CASES.find((preset) => preset.id === id) ?? null;
}
const $$_tpl_1$q = ['<ul aria-label="Games" class="px-0.5">', '</ul><div class="h-px mx-3 my-1 bg-[var(--separator)]"></div><button type="button" ', " ", '><span class="w-5 flex justify-center shrink-0">', "</span>Open a ROM file…</button><input ", ' type="file" accept=".gb,.gbc" class="hidden" ', ">"];
const $$_tpl_2$4 = ["<li ", '><button type="button" ', " ", " ", '><span class="w-5 flex justify-center shrink-0">', '</span><span class="truncate">', "</span></button></li>"];
const ROW_CLASSES$1 = "flex items-center gap-2 w-full h-10 pl-2 pr-3 rounded-2xl text-left text-[15px] hover:bg-[var(--fill)] active:bg-[var(--fill-strong)]";
function GameList({
  currentGame,
  pendingGame,
  onSelect,
  onRomFile
}) {
  const fileInput = A$1(null);
  const handleFile = (event) => {
    const input = event.target;
    const file = input.files?.[0];
    if (file) onRomFile(file);
    input.value = "";
  };
  return a$2($$_tpl_1$q, s$2(GAME_OPTIONS.map(({
    value,
    label
  }) => a$2($$_tpl_2$4, l$2("key", value), l$2("class", ROW_CLASSES$1), l$2("aria-current", value === currentGame || void 0), l$2("onclick", () => onSelect(value)), s$2(value === pendingGame ? u$2(SpinnerIcon, {
    class: "w-4 h-4 motion-safe:animate-spin"
  }) : value === currentGame && u$2(CheckIcon, {
    class: "w-4 h-4"
  })), s$2(label)))), l$2("class", ROW_CLASSES$1), l$2("onclick", () => fileInput.current?.click()), u$2(LoadRomIcon, {
    class: "w-4 h-4"
  }), l$2("ref", fileInput), l$2("onchange", handleFile));
}
const $$_tpl_1$p = ['<path stroke-linecap="round" stroke-linejoin="round" d="M6 3h9l3 3v14a1 1 0 01-1 1H7a1 1 0 01-1-1V3zm3 4h6v5H9V7zm0 10h2m4 0h.01"></path>'];
function CartridgeIcon(props) {
  return u$2("svg", {
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    viewBox: "0 0 24 24",
    ...props,
    children: a$2($$_tpl_1$p)
  });
}
const $$_tpl_1$o = ['<path stroke-linecap="round" stroke-linejoin="round" d="M7 17L17 7M8 7h9v9"></path>'];
function ArrowUpRightIcon(props) {
  return u$2("svg", {
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    viewBox: "0 0 24 24",
    ...props,
    children: a$2($$_tpl_1$o)
  });
}
const $$_tpl_1$n = ['<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path>'];
function ChevronRightIcon(props) {
  return u$2("svg", {
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    viewBox: "0 0 24 24",
    ...props,
    children: a$2($$_tpl_1$n)
  });
}
const $$_tpl_1$m = ['<path stroke-linecap="round" stroke-linejoin="round" d="M15 11.25l1.5 1.5.75-.75V8.76l2.28-.61a3 3 0 10-3.68-3.68l-.61 2.28H12l-.75.75 1.5 1.5M15 11.25l-8.47 8.47c-.34.34-.8.53-1.28.53s-.94.19-1.28.53l-.97.97-.75-.75.97-.97c.34-.34.53-.8.53-1.28s.19-.94.53-1.28L12.75 9M15 11.25L12.75 9"></path>'];
function DynamicIcon(props) {
  return u$2("svg", {
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    viewBox: "0 0 24 24",
    ...props,
    children: a$2($$_tpl_1$m)
  });
}
const $$_tpl_1$l = ['<path d="M6 10.25a1.75 1.75 0 110 3.5 1.75 1.75 0 010-3.5zm6 0a1.75 1.75 0 110 3.5 1.75 1.75 0 010-3.5zm6 0a1.75 1.75 0 110 3.5 1.75 1.75 0 010-3.5z"></path>'];
function EllipsisIcon(props) {
  return u$2("svg", {
    fill: "currentColor",
    viewBox: "0 0 24 24",
    ...props,
    children: a$2($$_tpl_1$l)
  });
}
const $$_tpl_1$k = ['<path stroke-linecap="round" stroke-linejoin="round" d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 010 1.954l-7.108 4.061A1.125 1.125 0 013 16.811V8.69zM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 010 1.954l-7.108 4.061a1.125 1.125 0 01-1.683-.977V8.69z"></path>'];
function FastForwardIcon(props) {
  return u$2("svg", {
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    viewBox: "0 0 24 24",
    ...props,
    children: a$2($$_tpl_1$k)
  });
}
const $$_tpl_1$j = ['<path stroke-linecap="round" stroke-linejoin="round" d="M10.3 4.3c.4-1.7 3-1.7 3.4 0a1.7 1.7 0 002.6 1.1c1.5-.9 3.3.8 2.4 2.4a1.7 1.7 0 001 2.5c1.8.4 1.8 3 0 3.4a1.7 1.7 0 00-1 2.6c.9 1.5-.9 3.3-2.4 2.4a1.7 1.7 0 00-2.6 1c-.4 1.8-3 1.8-3.4 0a1.7 1.7 0 00-2.5-1c-1.6.9-3.3-.9-2.4-2.4a1.7 1.7 0 00-1.1-2.6c-1.7-.4-1.7-3 0-3.4a1.7 1.7 0 001.1-2.5c-.9-1.6.8-3.3 2.4-2.4a1.7 1.7 0 002.5-1.1zM15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>'];
function GearIcon(props) {
  return u$2("svg", {
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    viewBox: "0 0 24 24",
    ...props,
    children: a$2($$_tpl_1$j)
  });
}
const $$_tpl_1$i = ['<path fill-rule="evenodd" clip-rule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"></path>'];
function GitHubIcon(props) {
  return u$2("svg", {
    fill: "currentColor",
    viewBox: "0 0 98 96",
    ...props,
    children: a$2($$_tpl_1$i)
  });
}
const $$_tpl_1$h = ['<path stroke-linecap="round" stroke-linejoin="round" d="M7 2h10a2 2 0 012 2v16a2 2 0 01-2 2H7a2 2 0 01-2-2V4a2 2 0 012-2zm1 3h8v6H8V5zm1 10h2m-1-1v2m5 0h.01M17 14h.01"></path>'];
function HandheldIcon(props) {
  return u$2("svg", {
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    viewBox: "0 0 24 24",
    ...props,
    children: a$2($$_tpl_1$h)
  });
}
const $$_tpl_1$g = ['<path stroke-linecap="round" stroke-linejoin="round" d="M5 4h14a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2zm3 17h8m-4-4v4m-5-8l3-3 2 2 4-4"></path>'];
function LcdIcon(props) {
  return u$2("svg", {
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    viewBox: "0 0 24 24",
    ...props,
    children: a$2($$_tpl_1$g)
  });
}
const $$_tpl_1$f = ['<path stroke-linecap="round" stroke-linejoin="round" d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8m0-5v5h5m4-1v5l3 2"></path>'];
function LoadIcon(props) {
  return u$2("svg", {
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    viewBox: "0 0 24 24",
    ...props,
    children: a$2($$_tpl_1$f)
  });
}
const $$_tpl_1$e = ['<path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>'];
function MoonIcon(props) {
  return u$2("svg", {
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2.5",
    viewBox: "0 0 24 24",
    ...props,
    children: a$2($$_tpl_1$e)
  });
}
const $$_tpl_1$d = ['<path stroke-linecap="round" stroke-linejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z"></path>'];
function PaletteIcon(props) {
  return u$2("svg", {
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    viewBox: "0 0 24 24",
    ...props,
    children: a$2($$_tpl_1$d)
  });
}
const $$_tpl_1$c = ['<path stroke-linecap="round" stroke-linejoin="round" d="M4 9V4h5m11 5V4h-5M4 15v5h5m11-5v5h-5"></path>'];
function ResizeIcon(props) {
  return u$2("svg", {
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    viewBox: "0 0 24 24",
    ...props,
    children: a$2($$_tpl_1$c)
  });
}
const $$_tpl_1$b = ['<path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"></path>'];
function SaveIcon(props) {
  return u$2("svg", {
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    viewBox: "0 0 24 24",
    ...props,
    children: a$2($$_tpl_1$b)
  });
}
const $$_tpl_1$a = ['<path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>'];
function SunIcon(props) {
  return u$2("svg", {
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2.5",
    viewBox: "0 0 24 24",
    ...props,
    children: a$2($$_tpl_1$a)
  });
}
const $$_tpl_1$9 = ['<path stroke-linecap="round" stroke-linejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"></path>'];
function TilesIcon(props) {
  return u$2("svg", {
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2.5",
    viewBox: "0 0 24 24",
    ...props,
    children: a$2($$_tpl_1$9)
  });
}
const $$_tpl_1$8 = ["", '<span class="flex flex-col flex-1 min-w-0 leading-tight"><span>', "</span>", "</span>"];
const $$_tpl_2$3 = ['<span class="text-[13px] text-[var(--label-secondary)]">', "</span>"];
const $$_tpl_3$3 = ['<button type="button" ', " ", ">", '<span class="text-[var(--label-secondary)]">', "</span></button>"];
const $$_tpl_4$2 = ['<span class="text-[var(--label-secondary)]">', "</span>"];
const $$_tpl_5$2 = ['<button type="button" role="switch" ', " ", " ", ">", '<span class="relative w-[38px] h-[22px] shrink-0 rounded-full bg-[var(--fill-strong)] group-aria-checked:bg-[#34c759]"><span class="absolute top-[2px] left-[2px] w-[18px] h-[18px] rounded-full bg-white shadow-[0_1px_3px_rgb(0_0_0/0.3)] transition-transform duration-200 ease-out group-aria-checked:translate-x-4"></span></span></button>'];
const $$_tpl_6$2 = ["<div ", ">", '<div role="radiogroup" ', ' class="flex shrink-0 p-0.5 rounded-full bg-[var(--fill)]">', "</div></div>"];
const $$_tpl_7$2 = ["<button ", ' type="button" role="radio" ', " ", " ", " ", " ", ">", "</button>"];
const $$_tpl_8$1 = ["<div ", '><div class="flex items-center gap-3">', '</div><div role="radiogroup" ', ' class="flex flex-wrap gap-2 pl-8 pb-1">', "</div></div>"];
const $$_tpl_9$1 = ["<button ", ' type="button" role="radio" ', " ", " ", ' class="w-6 h-6 rounded-full shadow-[inset_0_0_0_0.5px_rgb(0_0_0/0.2),inset_0_1px_1px_rgb(255_255_255/0.4)] outline-2 outline-offset-2 outline-transparent aria-checked:outline-[var(--label)]" ', " ", "></button>"];
const $$_tpl_10$1 = ['<div role="separator" class="h-px mx-3 my-1 bg-[var(--separator)]"></div>'];
const ROW_CLASSES = "flex items-center gap-3 w-full min-h-11 px-3 py-1.5 rounded-2xl text-left text-[15px] select-none";
const PRESSABLE_CLASSES = "hover:bg-[var(--fill)] active:bg-[var(--fill-strong)]";
const SEGMENT_CLASSES = "grid place-items-center min-w-8 h-7 px-2 rounded-full text-[13px] font-medium text-[var(--label-secondary)] aria-checked:text-[var(--label)] aria-checked:bg-white dark:aria-checked:bg-white/20 aria-checked:shadow-[0_1px_4px_rgb(0_0_0/0.14)]";
function RowLabel({
  icon: Icon,
  label,
  detail
}) {
  return a$2($$_tpl_1$8, u$2(Icon, {
    class: "w-5 h-5 shrink-0"
  }), s$2(label), s$2(detail && a$2($$_tpl_2$3, s$2(detail))));
}
function MenuAction({
  trailing,
  onClick,
  ...label
}) {
  return a$2($$_tpl_3$3, l$2("class", `${ROW_CLASSES} ${PRESSABLE_CLASSES}`), l$2("onclick", onClick), u$2(RowLabel, {
    ...label
  }), s$2(trailing));
}
function MenuLink({
  href,
  trailing,
  ...label
}) {
  return u$2("a", {
    href,
    target: "_blank",
    rel: "noopener noreferrer",
    class: `${ROW_CLASSES} ${PRESSABLE_CLASSES}`,
    children: [u$2(RowLabel, {
      ...label
    }), a$2($$_tpl_4$2, s$2(trailing))]
  });
}
function MenuSwitch({
  checked,
  onChange,
  ...label
}) {
  return a$2($$_tpl_5$2, l$2("aria-checked", checked), l$2("class", `${ROW_CLASSES} hover:bg-[var(--fill)] group`), l$2("onclick", () => onChange(!checked)), u$2(RowLabel, {
    ...label
  }));
}
function MenuChoice({
  choices,
  value,
  onChange,
  ...label
}) {
  return a$2($$_tpl_6$2, l$2("class", ROW_CLASSES), u$2(RowLabel, {
    ...label
  }), l$2("aria-label", label.label), s$2(choices.map((choice) => a$2($$_tpl_7$2, l$2("key", choice.value), l$2("aria-checked", choice.value === value), l$2("aria-label", choice.icon && choice.label), l$2("title", choice.icon && choice.label), l$2("class", SEGMENT_CLASSES), l$2("onclick", () => onChange(choice.value)), s$2(choice.icon ? u$2(choice.icon, {
    class: "w-4 h-4"
  }) : choice.label)))));
}
function MenuSwatches({
  swatches,
  value,
  onChange,
  ...label
}) {
  return a$2($$_tpl_8$1, l$2("class", `${ROW_CLASSES} flex-col items-stretch`), u$2(RowLabel, {
    ...label
  }), l$2("aria-label", label.label), s$2(swatches.map((swatch) => a$2($$_tpl_9$1, l$2("key", swatch.value), l$2("aria-checked", swatch.value === value), l$2("aria-label", swatch.label), l$2("title", swatch.label), l$2("style", {
    background: swatch.fill
  }), l$2("onclick", () => onChange(swatch.value))))));
}
function MenuSeparator() {
  return a$2($$_tpl_10$1);
}
const $$_tpl_1$7 = ['<path stroke-linecap="round" stroke-linejoin="round" d="M7 7l10 10M17 7L7 17"></path>'];
function CloseIcon(props) {
  return u$2("svg", {
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "3",
    viewBox: "0 0 24 24",
    ...props,
    children: a$2($$_tpl_1$7)
  });
}
const $$_tpl_1$6 = ['<p class="px-6 py-8 text-center text-[14px] text-[var(--label-secondary)]">No snapshots of this game yet. Save one to come back to this moment later.</p>'];
const $$_tpl_2$2 = ['<button type="button" class="block w-[calc(100%-1.5rem)] mx-3 mt-2 rounded-2xl overflow-hidden shadow-[0_0_0_0.5px_rgb(0_0_0/0.15),0_4px_14px_rgb(0_0_0/0.18)]" ', " ", ">", '</button><p class="px-3 pt-1.5 text-center text-[12px] text-[var(--label-secondary)]">', '</p><ul aria-label="Snapshots" class="grid grid-cols-3 gap-x-3 gap-y-2.5 px-3 pt-2 pb-3">', "</ul>"];
const $$_tpl_3$2 = ["<li ", " ", ' class="relative group" ', " ", '><button type="button" class="flex flex-col items-center gap-1 w-full rounded-xl" ', " ", ">", '<span class="text-[12px] text-[var(--label-secondary)]">', '</span></button><button type="button" class="absolute -top-1.5 -right-1.5 grid place-items-center w-5 h-5 rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100 transition-opacity" ', " ", ">", "</button></li>"];
const TIME_FORMAT = new Intl.DateTimeFormat(void 0, {
  hour: "numeric",
  minute: "2-digit"
});
const DATE_FORMAT = new Intl.DateTimeFormat(void 0, {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit"
});
function formatTime(time) {
  const date = new Date(time);
  return date.toDateString() === (/* @__PURE__ */ new Date()).toDateString() ? TIME_FORMAT.format(date) : DATE_FORMAT.format(date);
}
function SnapshotList({
  snapshots,
  onRestore,
  onDelete
}) {
  const [previewId, setPreviewId] = d$1(null);
  const preview = snapshots.find(({
    id
  }) => id === previewId) ?? snapshots[0];
  if (!preview) {
    return a$2($$_tpl_1$6);
  }
  return a$2($$_tpl_2$2, l$2("aria-label", `Load the snapshot from ${formatTime(preview.time)}`), l$2("onclick", () => onRestore(preview.id)), u$2("img", {
    src: preview.thumbnail,
    alt: "",
    width: 160,
    height: 144,
    class: "w-full h-auto [image-rendering:pixelated]"
  }), s$2(formatTime(preview.time)), s$2(snapshots.map(({
    id,
    time,
    thumbnail
  }) => a$2($$_tpl_3$2, l$2("key", id), l$2("data-previewed", id === preview.id || void 0), l$2("onpointerenter", () => setPreviewId(id)), l$2("onfocusin", () => setPreviewId(id)), l$2("aria-label", `Load the snapshot from ${formatTime(time)}`), l$2("onclick", () => onRestore(id)), u$2("img", {
    src: thumbnail,
    alt: "",
    width: 160,
    height: 144,
    class: "w-full h-auto rounded-[10px] shadow-[0_0_0_0.5px_rgb(0_0_0/0.15),0_2px_6px_rgb(0_0_0/0.15)] [image-rendering:pixelated] outline-2 outline-offset-2 outline-transparent group-data-previewed:outline-[var(--label-secondary)]"
  }), s$2(formatTime(time)), l$2("aria-label", `Delete the snapshot from ${formatTime(time)}`), l$2("onclick", () => onDelete(id)), u$2(CloseIcon, {
    class: "w-2.5 h-2.5"
  })))));
}
const $$_tpl_1$5 = ['<path stroke-linecap="round" stroke-linejoin="round" ', "></path>"];
const WAVES = {
  0: "M16 9.5l5 5m0-5l-5 5",
  1: "M15.5 9.5a3.5 3.5 0 010 5",
  2: "M15.5 9.5a3.5 3.5 0 010 5m3-8a7.5 7.5 0 010 11"
};
function SpeakerIcon({
  level,
  ...props
}) {
  return u$2("svg", {
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    viewBox: "0 0 24 24",
    ...props,
    children: a$2($$_tpl_1$5, l$2("d", `M11 5L6 9H3v6h3l5 4V5z${WAVES[level]}`))
  });
}
const $$_tpl_1$4 = ["<div ", ">", '<input type="range" min="0" max="100" step="5" ', " ", " ", ' aria-label="Volume" ', " ", " ", " ", "></div>"];
function VolumeControl({
  volume,
  onVolumeChange,
  wide = false
}) {
  const restoreTo = A$1(volume || DEFAULT_VOLUME);
  const percent = Math.round(volume * 100);
  const toggleMute = () => {
    if (volume > 0) {
      restoreTo.current = volume;
      onVolumeChange(0);
    } else {
      onVolumeChange(restoreTo.current);
    }
  };
  return a$2($$_tpl_1$4, l$2("class", `flex items-center gap-1 pr-2 ${wide ? "w-full" : ""}`), u$2(DockButton, {
    label: volume > 0 ? "Mute" : "Unmute",
    onClick: toggleMute,
    children: u$2(SpeakerIcon, {
      level: volume === 0 ? 0 : volume < 0.5 ? 1 : 2,
      class: "w-5 h-5"
    })
  }), l$2("value", percent), l$2("class", `slider ${wide ? "flex-1" : "w-16 sm:w-24"}`), l$2("style", {
    "--value": volume
  }), l$2("aria-valuetext", `${percent}%`), l$2("title", `Volume ${percent}%`), l$2("onpointerup", (event) => event.currentTarget.blur()), l$2("oninput", (event) => onVolumeChange(Number(event.target.value) / 100)));
}
const $$_tpl_1$3 = ['<button type="button" class="flex items-center gap-2 w-full min-h-11 px-3 rounded-2xl text-left hover:bg-[var(--fill)]" ', ">", '<span class="flex flex-col min-w-0 leading-tight"><span class="text-[15px] font-semibold">', '</span><span class="text-[13px] text-[var(--label-secondary)] truncate">', "</span></span></button>"];
const $$_tpl_3$1 = ["<div ", ' role="dialog" ', ' tabindex="-1" class="p-1.5 outline-none max-h-[70dvh] overflow-y-auto overscroll-contain">', "", "", "</div>"];
const $$_tpl_2$1 = ["<button ", ' type="button" ', ' aria-label="More options" title="More options" aria-haspopup="dialog" ', " ", " ", ">", "</button>", ""];
const $$_tpl_4$1 = ["", "", "", "", "", "", "", "", "", "", "", "", ""];
const $$_tpl_5$1 = ["", '<div class="px-1.5 py-0.5">', "</div>", ""];
const $$_tpl_6$1 = ["", "", ""];
const $$_tpl_7$1 = ["", "", ""];
const PAGE_TITLES = {
  settings: "More options",
  snapshots: "Snapshots",
  games: "Games"
};
const PANEL_ID = "settings-menu";
const SCALES = [{
  value: "fit",
  label: "Fit"
}, {
  value: 1,
  label: "1×"
}, {
  value: 2,
  label: "2×"
}, {
  value: 3,
  label: "3×"
}];
const THEMES$1 = [{
  value: "light",
  label: "Light",
  icon: SunIcon
}, {
  value: "dark",
  label: "Dark",
  icon: MoonIcon
}, {
  value: "auto",
  label: "Dynamic",
  icon: DynamicIcon
}];
const HANDHELDS = [...CASES.map(({
  id,
  name,
  body,
  translucent
}) => ({
  value: id,
  label: name,
  fill: `rgb(${body.join(" ")} / ${translucent ? 0.7 : 1})`
})), {
  value: "dynamic",
  label: "Dynamic",
  fill: "conic-gradient(from 200deg, #ff6b8b, #ffc56b, #8ee57a, #6bb8ff, #b48bff, #ff6b8b)"
}];
const PALETTES$1 = [{
  value: "gray",
  label: "Gray"
}, {
  value: "green",
  label: "Green"
}];
function PageHeader({
  title,
  subtitle,
  onBack
}) {
  return a$2($$_tpl_1$3, l$2("onclick", onBack), u$2(ChevronRightIcon, {
    class: "w-4 h-4 rotate-180 shrink-0"
  }), s$2(title), s$2(subtitle));
}
function SettingsMenu({
  settings,
  touch,
  currentGame,
  pendingGame,
  onGameChange,
  onRomFile,
  volume,
  onVolumeChange,
  onChange,
  snapshots,
  onSaveSnapshot,
  onRestoreSnapshot,
  onDeleteSnapshot,
  open,
  onOpenChange
}) {
  const triggerRef = A$1(null);
  const panelRef = A$1(null);
  const [page, setPage] = d$1("settings");
  const close = () => onOpenChange(false);
  useDismiss(open, close, [triggerRef, panelRef]);
  h$1(() => {
    if (!open) setPage("settings");
  }, [open]);
  h$1(() => {
    const panel = panelRef.current;
    if (open) {
      panel?.querySelector("[role=dialog]")?.focus({
        preventScroll: true
      });
    } else if (panel?.contains(document.activeElement)) {
      triggerRef.current?.focus({
        preventScroll: true
      });
    }
  }, [open, page]);
  const save = () => {
    close();
    onSaveSnapshot();
  };
  const restore = (id) => {
    close();
    onRestoreSnapshot(id);
  };
  const selectGame = (game) => {
    close();
    onGameChange(game);
  };
  const openRom = (file) => {
    close();
    onRomFile(file);
  };
  const gameTitle = currentGame ? formatGameName(currentGame) : "";
  return a$2($$_tpl_2$1, l$2("ref", triggerRef), l$2("class", touch ? "case-gear grid place-items-center w-9 h-9 rounded-full" : "grid place-items-center w-10 h-10 rounded-full hover:bg-[var(--fill)] aria-expanded:bg-[var(--fill)]"), l$2("aria-expanded", open), l$2("aria-controls", PANEL_ID), l$2("onclick", () => onOpenChange(!open)), s$2(touch ? u$2(GearIcon, {
    class: "w-[22px] h-[22px]"
  }) : u$2(EllipsisIcon, {
    class: "w-5 h-5"
  })), u$2(Popover, {
    open,
    align: "end",
    side: touch ? "below" : "above",
    panelRef,
    class: "w-[min(21rem,calc(100vw-2rem))]",
    children: a$2($$_tpl_3$1, l$2("id", PANEL_ID), l$2("aria-label", PAGE_TITLES[page]), s$2(page === "settings" && a$2($$_tpl_4$1, s$2(touch && a$2($$_tpl_5$1, u$2(MenuAction, {
      icon: CartridgeIcon,
      label: gameTitle || "Loading…",
      detail: "Change the game",
      trailing: u$2(ChevronRightIcon, {
        class: "w-4 h-4"
      }),
      onClick: () => setPage("games")
    }), u$2(VolumeControl, {
      volume,
      onVolumeChange,
      wide: true
    }), u$2(MenuSeparator, null))), u$2(MenuAction, {
      icon: SaveIcon,
      label: "Save snapshot",
      detail: "Keep the game exactly as it is now",
      onClick: save
    }), u$2(MenuAction, {
      icon: LoadIcon,
      label: "Load snapshot",
      detail: snapshots.length ? `${snapshots.length} saved for this game` : "None saved for this game yet",
      trailing: u$2(ChevronRightIcon, {
        class: "w-4 h-4"
      }),
      onClick: () => setPage("snapshots")
    }), u$2(MenuSwitch, {
      icon: FastForwardIcon,
      label: "Fast forward",
      detail: "Run the game as fast as possible",
      checked: settings.turbo,
      onChange: (value) => onChange("turbo", value)
    }), u$2(MenuSeparator, null), u$2(MenuChoice, {
      icon: ResizeIcon,
      label: "Size",
      choices: SCALES,
      value: settings.scale,
      onChange: (value) => onChange("scale", value)
    }), s$2(touch ? u$2(MenuSwatches, {
      icon: HandheldIcon,
      label: "Case",
      detail: HANDHELDS.find(({
        value
      }) => value === settings.handheld)?.label,
      swatches: HANDHELDS,
      value: settings.handheld,
      onChange: (value) => onChange("handheld", value)
    }) : u$2(MenuChoice, {
      icon: SunIcon,
      label: "Theme",
      detail: THEMES$1.find(({
        value
      }) => value === settings.theme)?.label,
      choices: THEMES$1,
      value: settings.theme,
      onChange: (value) => onChange("theme", value)
    })), u$2(MenuChoice, {
      icon: PaletteIcon,
      label: "Palette",
      detail: "Original Game Boy games",
      choices: PALETTES$1,
      value: settings.palette,
      onChange: (value) => onChange("palette", value)
    }), u$2(MenuSwitch, {
      icon: LcdIcon,
      label: "Color correction",
      detail: "Mimic the Game Boy Color screen",
      checked: settings.colorCorrection,
      onChange: (value) => onChange("colorCorrection", value)
    }), s$2(!touch && u$2(MenuSwitch, {
      icon: TilesIcon,
      label: "Tile viewer",
      detail: "Show the graphics in video memory",
      checked: settings.showTiles,
      onChange: (value) => onChange("showTiles", value)
    })), u$2(MenuSeparator, null), u$2(MenuLink, {
      icon: GitHubIcon,
      label: "Source code",
      href: "https://github.com/Jabolol/gameboy",
      trailing: u$2(ArrowUpRightIcon, {
        class: "w-4 h-4"
      })
    }))), s$2(page === "snapshots" && a$2($$_tpl_6$1, u$2(PageHeader, {
      title: "Snapshots",
      subtitle: gameTitle,
      onBack: () => setPage("settings")
    }), u$2(SnapshotList, {
      snapshots,
      onRestore: restore,
      onDelete: onDeleteSnapshot
    }))), s$2(page === "games" && a$2($$_tpl_7$1, u$2(PageHeader, {
      title: "Games",
      subtitle: gameTitle,
      onBack: () => setPage("settings")
    }), u$2(GameList, {
      currentGame,
      pendingGame,
      onSelect: selectGame,
      onRomFile: openRom
    }))))
  }));
}
const $$_tpl_1$2 = ['<path stroke-linejoin="round" d="M8 5l10 7-10 7z"></path>'];
function TriangleIcon(props) {
  return u$2("svg", {
    fill: "currentColor",
    stroke: "currentColor",
    "stroke-width": "3",
    viewBox: "0 0 24 24",
    ...props,
    children: a$2($$_tpl_1$2)
  });
}
const $$_tpl_1$1 = ['<svg class="absolute inset-0 overflow-visible" ', " ", '><defs><linearGradient id="dpad-sheen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.16"></stop><stop offset="1" stop-color="#000" stop-opacity="0.22"></stop></linearGradient></defs><path ', " ", ' class="plastic-cross"></path><path ', ' fill="url(#dpad-sheen)"></path></svg>'];
const $$_tpl_2 = ['<div class="relative" ', ">", '<span class="absolute inset-0 m-auto w-6 h-6 rounded-full bg-[var(--pad-dimple)] shadow-[inset_0_1px_2px_rgb(0_0_0/0.25)]"></span></div>'];
const $$_tpl_3 = ["<div ", " ", ' class="group absolute inset-0" ', '><span class="absolute right-0 inset-y-0 my-auto bg-[var(--pad-press)] opacity-0 transition-opacity duration-100 group-data-pressed:opacity-100" ', "></span>", "</div>"];
const $$_tpl_4 = ['<div role="group" aria-label="Directional pad" class="relative shrink-0 touch-none select-none transition-transform duration-75 ease-out" ', " ", " ", " ", " ", " ", " ", ">", "", "</div>"];
const $$_tpl_5 = ["", ""];
const $$_tpl_6 = ["<div ", ">", "</div>"];
const $$_tpl_7 = ["<span ", " ", ">", "</span>"];
const $$_tpl_8 = ['<button type="button" ', " ", ' class="shrink-0 rounded-full touch-none select-none" ', " ", " ", " ", " ", '><span class="plastic-key grid place-items-center rounded-full" ', ">", "</span></button>"];
const $$_tpl_9 = ['<span class="text-[19px] font-bold text-[var(--key-label)]">', "</span>"];
const $$_tpl_10 = ["<div ", '><div class="flex w-full items-center justify-between">', "<div ", "><div ", ">", "", '</div><div class="flex flex-col items-center gap-1.5">', "", "</div></div></div>", "</div>"];
const $$_tpl_11 = ['<div class="flex gap-2 mt-1 mr-6"><div class="flex flex-col items-center gap-1.5 -rotate-[25deg]">', "", '</div><div class="flex flex-col items-center gap-1.5 mt-4 -rotate-[25deg]">', "", "</div></div>"];
const $$_tpl_12 = ['<div class="flex flex-col items-center gap-1.5"><div class="flex gap-6">', "", '</div><div class="flex gap-6">', "", "</div></div>"];
const DPAD_SIZE = 120;
const DPAD_ARM = 40;
const DPAD_RADIUS = 8;
const TILT_DEGREES = 8;
const DEAD_ZONE = 0.2;
const HAPTIC_MS = 8;
const DIRECTIONS = ["right", "down", "left", "up"];
const TILTS = {
  right: `rotateY(${TILT_DEGREES}deg)`,
  down: `rotateX(-${TILT_DEGREES}deg)`,
  left: `rotateY(-${TILT_DEGREES}deg)`,
  up: `rotateX(${TILT_DEGREES}deg)`
};
const SECTORS = [["right"], ["right", "down"], ["down"], ["down", "left"], ["left"], ["left", "up"], ["up"], ["up", "right"]];
function directionsAt(event) {
  const rect = event.currentTarget.getBoundingClientRect();
  const x2 = event.clientX - rect.left - rect.width / 2;
  const y2 = event.clientY - rect.top - rect.height / 2;
  if (Math.hypot(x2, y2) < rect.width / 2 * DEAD_ZONE) return [];
  const sector = Math.round(Math.atan2(y2, x2) / (Math.PI / 4));
  return SECTORS[(sector + 8) % 8];
}
function PlasticCross({
  color
}) {
  const outline = crossPath(DPAD_SIZE, DPAD_SIZE, DPAD_ARM, DPAD_RADIUS);
  return a$2($$_tpl_1$1, l$2("width", DPAD_SIZE), l$2("height", DPAD_SIZE), l$2("d", outline), l$2("style", {
    fill: color
  }), l$2("d", outline));
}
function DirectionalPad({
  onButton,
  preset
}) {
  const [pressed, setPressed] = d$1([]);
  const current = A$1([]);
  const press = (next) => {
    if (next.join() === current.current.join()) return;
    for (const direction of DIRECTIONS) {
      const down = next.includes(direction);
      if (down !== current.current.includes(direction)) {
        onButton(direction, down);
      }
    }
    if (next.length) navigator.vibrate?.(HAPTIC_MS);
    current.current = next;
    setPressed(next);
  };
  const release = () => press([]);
  const face = a$2($$_tpl_2, l$2("style", {
    width: `${DPAD_SIZE}px`,
    height: `${DPAD_SIZE}px`
  }), s$2(DIRECTIONS.map((direction, index) => a$2($$_tpl_3, l$2("key", direction), l$2("data-pressed", pressed.includes(direction) || void 0), l$2("style", {
    transform: `rotate(${index * 90}deg)`
  }), l$2("style", {
    width: `${(DPAD_SIZE - DPAD_ARM) / 2}px`,
    height: `${DPAD_ARM}px`,
    borderRadius: `0 ${DPAD_RADIUS}px ${DPAD_RADIUS}px 0`
  }), u$2(TriangleIcon, {
    class: "absolute right-3.5 inset-y-0 my-auto w-3 h-3 text-[var(--pad-mark)] transition-colors duration-100 group-data-pressed:text-[var(--pad-mark-active)]"
  })))));
  return a$2($$_tpl_4, l$2("style", {
    width: `${DPAD_SIZE}px`,
    height: `${DPAD_SIZE}px`,
    transform: `perspective(360px) ${pressed.map((direction) => TILTS[direction]).join(" ")}`
  }), l$2("onpointerdown", (event) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    press(directionsAt(event));
  }), l$2("onpointermove", (event) => {
    const target = event.currentTarget;
    if (target.hasPointerCapture(event.pointerId)) {
      press(directionsAt(event));
    }
  }), l$2("onpointerup", release), l$2("onpointercancel", release), l$2("onlostpointercapture", release), l$2("oncontextmenu", (event) => event.preventDefault()), u$2(PlasticCross, {
    color: preset.dpad
  }), s$2(face));
}
function Well({
  preset,
  class: classes = "",
  children
}) {
  if (preset.model !== "gbc") return a$2($$_tpl_5, s$2(children));
  return a$2($$_tpl_6, l$2("class", `control-well grid place-items-center ${classes}`), s$2(children));
}
function Caption({
  preset,
  children
}) {
  return a$2($$_tpl_7, l$2("class", `select-none ${preset.model === "dmg" ? "text-[11px] font-extrabold italic tracking-[0.12em]" : "text-[9px] font-bold tracking-[0.14em] opacity-70"}`), l$2("style", {
    color: preset.ink
  }), s$2(children));
}
function PadButton({
  button,
  label,
  width,
  height,
  color,
  engraved = false,
  onButton
}) {
  const [pressed, setPressed] = d$1(false);
  const current = A$1(false);
  const press = (down) => (event) => {
    event.preventDefault();
    if (down === current.current) return;
    if (down) {
      event.currentTarget.setPointerCapture(event.pointerId);
      navigator.vibrate?.(HAPTIC_MS);
    }
    onButton(button, down);
    current.current = down;
    setPressed(down);
  };
  return a$2($$_tpl_8, l$2("aria-label", label), l$2("data-pressed", pressed || void 0), l$2("onpointerdown", press(true)), l$2("onpointerup", press(false)), l$2("onpointercancel", press(false)), l$2("onlostpointercapture", press(false)), l$2("oncontextmenu", (event) => event.preventDefault()), l$2("style", {
    width: `${width}px`,
    height: `${height}px`,
    backgroundColor: color
  }), s$2(engraved && a$2($$_tpl_9, s$2(label))));
}
function TouchControls({
  onButton,
  preset
}) {
  const dmg = preset.model === "dmg";
  const face = {
    onButton,
    preset,
    color: preset.buttons,
    engraved: !dmg,
    width: 54,
    height: 54
  };
  const rubber = {
    onButton,
    preset,
    color: preset.rubber,
    width: dmg ? 46 : 40,
    height: 13
  };
  return a$2($$_tpl_10, l$2("class", `pad-plastic hidden pointer-coarse:flex flex-col items-center gap-4 w-full max-w-sm px-2 ${dmg ? "pad-dmg" : ""}`), u$2(Well, {
    preset,
    class: "w-[150px] h-[150px] -ml-2 rounded-full",
    children: u$2(DirectionalPad, {
      onButton,
      preset
    })
  }), l$2("class", `flex items-start ${dmg ? "gap-5" : "gap-4"} pr-1`), l$2("class", `flex flex-col items-center gap-1.5 ${dmg ? "mt-5" : "mt-9"}`), u$2(Well, {
    preset,
    class: "p-1.5 rounded-full",
    children: u$2(PadButton, {
      button: "b",
      label: "B",
      ...face
    })
  }), s$2(dmg && u$2(Caption, {
    preset,
    children: "B"
  })), u$2(Well, {
    preset,
    class: "p-1.5 rounded-full",
    children: u$2(PadButton, {
      button: "a",
      label: "A",
      ...face
    })
  }), s$2(dmg && u$2(Caption, {
    preset,
    children: "A"
  })), s$2(dmg ? a$2($$_tpl_11, u$2(PadButton, {
    button: "select",
    label: "Select",
    ...rubber
  }), u$2(Caption, {
    preset,
    children: "SELECT"
  }), u$2(PadButton, {
    button: "start",
    label: "Start",
    ...rubber
  }), u$2(Caption, {
    preset,
    children: "START"
  })) : a$2($$_tpl_12, u$2(PadButton, {
    button: "select",
    label: "Select",
    ...rubber
  }), u$2(PadButton, {
    button: "start",
    label: "Start",
    ...rubber
  }), u$2(Caption, {
    preset,
    children: "SELECT"
  }), u$2(Caption, {
    preset,
    children: "START"
  }))));
}
function useFittedScale(scale, width, height, stageRef, controlsRef, inset) {
  const stage = useElementSize(stageRef);
  const controls = useElementSize(controlsRef);
  if (!stage || !controls) return scale === "fit" ? 1 : scale;
  const pixels = width * (self.devicePixelRatio || 1);
  const ratio = Math.min((stage.width - inset.width) / width, (stage.height - controls.height - inset.height) / height);
  const fitting = Math.floor(ratio * pixels) / pixels;
  return scale === "fit" ? fitting : Math.min(scale, fitting);
}
const GAMEPAD_BUTTONS = [[0, "b"], [1, "a"], [8, "select"], [9, "start"], [12, "up"], [13, "down"], [14, "left"], [15, "right"]];
const TURBO_BUTTON = 5;
const AXIS_THRESHOLD = 0.5;
const RUMBLE_MS = 100;
function readButtons(pad) {
  const state = Object.fromEntries(GAMEPAD_BUTTONS.map(([index, button]) => [button, pad.buttons[index]?.pressed ?? false]));
  const [x2 = 0, y2 = 0] = pad.axes;
  state.left ||= x2 < -AXIS_THRESHOLD;
  state.right ||= x2 > AXIS_THRESHOLD;
  state.up ||= y2 < -AXIS_THRESHOLD;
  state.down ||= y2 > AXIS_THRESHOLD;
  return state;
}
function vibrate(pad) {
  if (pad?.vibrationActuator) {
    pad.vibrationActuator.playEffect("dual-rumble", {
      duration: RUMBLE_MS,
      strongMagnitude: 1,
      weakMagnitude: 1
    });
  } else {
    navigator.vibrate?.(RUMBLE_MS);
  }
}
function useGamepad(session, onTurbo) {
  h$1(() => {
    if (!session) return;
    const previous = {};
    let turbo = false;
    let rumbleUntil = 0;
    let frame = 0;
    const poll = (time) => {
      const pad = navigator.getGamepads().find((p2) => p2?.connected) ?? void 0;
      if (pad) {
        const state = readButtons(pad);
        for (const [, button] of GAMEPAD_BUTTONS) {
          if (state[button] !== (previous[button] ?? false)) {
            session.button(button, state[button]);
            previous[button] = state[button];
          }
        }
        const turboPressed = pad.buttons[TURBO_BUTTON]?.pressed ?? false;
        if (turboPressed !== turbo) {
          turbo = turboPressed;
          onTurbo(turbo);
        }
      }
      if (session.rumble() && time >= rumbleUntil) {
        vibrate(pad);
        rumbleUntil = time + RUMBLE_MS;
      }
      frame = requestAnimationFrame(poll);
    };
    frame = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(frame);
  }, [session, onTurbo]);
}
function useMediaQuery(query) {
  const [matches, setMatches] = d$1(false);
  h$1(() => {
    const media = self.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);
  return matches;
}
const THUMBNAIL_WIDTH = 160;
const THUMBNAIL_HEIGHT = 144;
function captureThumbnail(canvas) {
  const thumbnail = document.createElement("canvas");
  thumbnail.width = THUMBNAIL_WIDTH;
  thumbnail.height = THUMBNAIL_HEIGHT;
  drawFrame(canvas, thumbnail);
  return thumbnail.toDataURL();
}
function useSnapshots(session, canvasRef) {
  const [snapshots, setSnapshots] = d$1([]);
  h$1(() => {
    setSnapshots(session?.snapshots() ?? []);
  }, [session]);
  const saveSnapshot = async () => {
    if (!session || !canvasRef.current) return;
    setSnapshots(await session.takeSnapshot(captureThumbnail(canvasRef.current)));
  };
  const restoreSnapshot = (id) => session?.restoreSnapshot(id);
  const deleteSnapshot2 = (id) => {
    if (session) setSnapshots(session.deleteSnapshot(id));
  };
  return {
    snapshots,
    saveSnapshot,
    restoreSnapshot,
    deleteSnapshot: deleteSnapshot2
  };
}
function usePersistedState(key, storage, defaultValue) {
  const [state, setState] = d$1(() => storage.get(key, defaultValue));
  h$1(() => {
    storage.set(key, state);
  }, [key, state, storage]);
  return [state, setState];
}
function usePlayback(session) {
  h$1(() => {
    if (!session) return;
    let wakeLock = null;
    const release = () => {
      wakeLock?.then((sentinel) => sentinel?.release());
      wakeLock = null;
    };
    const update = () => {
      session.configure("paused", document.hidden);
      if (document.hidden) {
        release();
      } else if (!wakeLock && "wakeLock" in navigator) {
        wakeLock = navigator.wakeLock.request("screen").catch(() => null);
      }
    };
    update();
    document.addEventListener("visibilitychange", update);
    return () => {
      document.removeEventListener("visibilitychange", update);
      release();
    };
  }, [session]);
}
function useShortcuts(shortcuts) {
  const current = A$1(shortcuts);
  current.current = shortcuts;
  h$1(() => {
    const onKey = (event) => {
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      const shortcut = current.current[event.key.toLowerCase()];
      if (!shortcut) return;
      event.preventDefault();
      shortcut(event.type === "keydown");
    };
    self.addEventListener("keydown", onKey);
    self.addEventListener("keyup", onKey);
    return () => {
      self.removeEventListener("keydown", onKey);
      self.removeEventListener("keyup", onKey);
    };
  }, []);
}
const BIN_SHIFT = 4;
const LIGHT_LABEL = [245, 245, 247];
const DARK_LABEL = [29, 29, 31];
const ACCENT_MIN_SATURATION = 12;
const ACCENT_FALLBACK_HUE = 345;
function luminance(color) {
  const [r2, g2, b2] = color.map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r2 + 0.7152 * g2 + 0.0722 * b2;
}
function contrast(a2, b2) {
  const [light, dark] = [luminance(a2), luminance(b2)].sort((x2, y2) => y2 - x2);
  return (light + 0.05) / (dark + 0.05);
}
function prefersLightText(background) {
  return contrast(background, LIGHT_LABEL) > contrast(background, DARK_LABEL);
}
function hueAndSaturation([r2, g2, b2]) {
  const max = Math.max(r2, g2, b2);
  const min = Math.min(r2, g2, b2);
  const delta = max - min;
  if (!delta) return [0, 0];
  const hue = max === r2 ? ((g2 - b2) / delta + 6) % 6 : max === g2 ? (b2 - r2) / delta + 2 : (r2 - g2) / delta + 4;
  const lightness = (max + min) / 510;
  const saturation = delta / 255 / (1 - Math.abs(2 * lightness - 1));
  return [hue * 60, saturation * 100];
}
function contrastAccent(background) {
  const [hue, saturation] = hueAndSaturation(background);
  if (prefersLightText(background)) {
    return [`hsl(${hue} ${Math.min(saturation, 30)}% 93%)`, "rgb(0 0 0 / 0.3)"];
  }
  const accent = saturation < ACCENT_MIN_SATURATION ? ACCENT_FALLBACK_HUE : (hue + 180) % 360;
  return [`hsl(${accent} 68% 40%)`, "rgb(255 255 255 / 0.3)"];
}
function edgeColor(image, ring) {
  const {
    width,
    height,
    data
  } = image;
  const bins = /* @__PURE__ */ new Map();
  let dominant = [255, 255, 255, 1];
  for (let y2 = 0; y2 < height; y2++) {
    const edgeRow = y2 < ring || y2 >= height - ring;
    for (let x2 = 0; x2 < width; x2++) {
      if (!edgeRow && x2 >= ring && x2 < width - ring) continue;
      const i2 = (y2 * width + x2) * 4;
      const [r22, g22, b22] = [data[i2], data[i2 + 1], data[i2 + 2]];
      const key = r22 >> BIN_SHIFT << 16 | g22 >> BIN_SHIFT << 8 | b22 >> BIN_SHIFT;
      const bin = bins.get(key) ?? [0, 0, 0, 0];
      bin[0] += r22;
      bin[1] += g22;
      bin[2] += b22;
      bin[3]++;
      bins.set(key, bin);
      if (bin[3] > dominant[3]) dominant = bin;
    }
  }
  const [r2, g2, b2, count] = dominant;
  return [Math.round(r2 / count), Math.round(g2 / count), Math.round(b2 / count)];
}
const FRAME_WIDTH = 160;
const FRAME_HEIGHT = 144;
const EDGE_RING = 4;
function paintPage(dark, background) {
  const root2 = document.documentElement;
  root2.classList.toggle("dark", dark);
  if (background) {
    const [accent, label] = contrastAccent(background);
    root2.style.setProperty("--bg-color", background.join(" "));
    root2.style.setProperty("--accent", accent);
    root2.style.setProperty("--accent-label", label);
  } else {
    root2.style.removeProperty("--bg-color");
    root2.style.removeProperty("--accent");
    root2.style.removeProperty("--accent-label");
  }
  const color = getComputedStyle(root2).getPropertyValue("--bg-color").trim();
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", `rgb(${color})`);
}
function usePageTheme(theme, canvasRef, fixed) {
  h$1(() => {
    if (fixed) {
      paintPage(prefersLightText(fixed), fixed);
      return;
    }
    if (theme !== "auto") {
      paintPage(theme === "dark");
      return;
    }
    const frame = document.createElement("canvas");
    frame.width = FRAME_WIDTH;
    frame.height = FRAME_HEIGHT;
    let painted = "";
    let request = 0;
    const sample = () => {
      request = requestAnimationFrame(sample);
      const canvas = canvasRef.current;
      if (!canvas?.width || !canvas.height) return;
      const image = drawFrame(canvas, frame).getImageData(0, 0, FRAME_WIDTH, FRAME_HEIGHT);
      const color = edgeColor(image, EDGE_RING);
      const key = color.join();
      if (key !== painted) {
        painted = key;
        paintPage(prefersLightText(color), color);
      }
    };
    request = requestAnimationFrame(sample);
    return () => cancelAnimationFrame(request);
  }, [theme, canvasRef, fixed]);
}
const VALID_SCALES = ["fit", 1, 2, 3];
const BUTTONS = {
  a: 1,
  b: 2,
  select: 4,
  start: 8,
  right: 16,
  left: 32,
  up: 64,
  down: 128
};
const REQUESTS = {
  saveState: 1,
  loadState: 2
};
const SETTINGS = {
  turbo: 0,
  palette: 1,
  colorCorrection: 2,
  tiles: 3,
  paused: 4
};
const PALETTES = ["gray", "green"];
const THEMES = ["light", "dark", "auto"];
function createTypedStorage(parse2, serialize = String, validate) {
  return {
    get(key, defaultValue) {
      if (typeof localStorage === "undefined") return defaultValue;
      const raw = localStorage.getItem(key);
      if (!raw) return defaultValue;
      try {
        const parsed = parse2(raw);
        return validate?.(parsed) ?? true ? parsed : defaultValue;
      } catch {
        return defaultValue;
      }
    },
    set(key, value) {
      if (typeof localStorage === "undefined") return;
      localStorage.setItem(key, serialize(value));
    }
  };
}
const numberStorage = createTypedStorage(parseFloat);
const booleanStorage = createTypedStorage((v2) => v2 === "true");
const UNLOCK_EVENTS = ["pointerup", "touchend", "keydown", "click"];
function resumeOnInteraction(audioContext) {
  const resume = () => {
    audioContext.resume().then(() => {
      if (audioContext.state !== "running") return;
      for (const type of UNLOCK_EVENTS) {
        self.removeEventListener(type, resume, true);
      }
    });
  };
  const arm = () => {
    if (audioContext.state === "running") return;
    for (const type of UNLOCK_EVENTS) {
      self.addEventListener(type, resume, true);
    }
  };
  arm();
  audioContext.addEventListener("statechange", arm);
}
function createAudioContextProxy(OriginalAudioContext) {
  return new Proxy(OriginalAudioContext, {
    construct(target, args) {
      const audioContext = Reflect.construct(target, args);
      const volume = numberStorage.get(STORAGE_KEYS.volume, DEFAULT_VOLUME);
      const gainNode = audioContext.createGain();
      gainNode.gain.value = volume;
      const realDestination = audioContext.destination;
      gainNode.connect(realDestination);
      self.audioVolumeControl = {
        gainNode,
        setVolume: (v2) => {
          gainNode.gain.value = v2;
        }
      };
      Object.defineProperty(audioContext, "destination", {
        get: () => gainNode,
        configurable: true
      });
      resumeOnInteraction(audioContext);
      return audioContext;
    }
  });
}
function setupVolumeControl() {
  if (typeof self === "undefined") return;
  if (navigator.audioSession) navigator.audioSession.type = "playback";
  const OriginalAudioContext = self.AudioContext ?? self.webkitAudioContext;
  if (!OriginalAudioContext) return;
  const ProxiedAudioContext = createAudioContextProxy(OriginalAudioContext);
  self.AudioContext = ProxiedAudioContext;
  if (self.webkitAudioContext) {
    self.webkitAudioContext = ProxiedAudioContext;
  }
}
const ROMS_DIRECTORY = "/roms";
const SAVES_DIRECTORY = "/saves";
const ROM_EXTENSION = /\.gbc?$/i;
const TITLE_START = 308;
const TITLE_END = 324;
const CHECKSUM = 334;
function romIdentity(data) {
  const title = String.fromCharCode(...data.subarray(TITLE_START, TITLE_END)).replace(/[^\x20-\x7e]/g, "").trim();
  const checksum = (data[CHECKSUM] << 8 | data[CHECKSUM + 1]).toString(16).padStart(4, "0");
  return `${sanitizeRomName(title) || "rom"}-${checksum}`;
}
async function prepareFilesystem(module) {
  const {
    FS
  } = module;
  FS.mkdir(ROMS_DIRECTORY);
  FS.mkdir(SAVES_DIRECTORY);
  FS.mount(FS.filesystems.IDBFS, {
    autoPersist: true
  }, SAVES_DIRECTORY);
  await new Promise((resolve2, reject) => FS.syncfs(true, (error) => error ? reject(error) : resolve2()));
}
function installRom(module, name, data) {
  const rom = `${ROMS_DIRECTORY}/${name}`;
  const save = isValidGame(name) ? name : romIdentity(data);
  module.FS.writeFile(rom, data);
  return {
    rom,
    save: `${SAVES_DIRECTORY}/${save}`
  };
}
function isRomFile(name) {
  return ROM_EXTENSION.test(name);
}
function sanitizeRomName(name) {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
}
const SNAPSHOT_LIMIT = 12;
const WRITE_TIMEOUT_MS = 2e3;
const statePath = (save, id) => id ? `${save}.${id}.state` : `${save}.state`;
const indexPath = (save) => `${save}.snapshots.json`;
function exists(module, path) {
  return module.FS.analyzePath(path).exists;
}
function writeSnapshots(module, save, snapshots) {
  module.FS.writeFile(indexPath(save), JSON.stringify(snapshots));
  return snapshots;
}
function readSnapshots(module, save) {
  if (!exists(module, indexPath(save))) return [];
  try {
    return JSON.parse(module.FS.readFile(indexPath(save), {
      encoding: "utf8"
    }));
  } catch {
    return [];
  }
}
function stateModifiedAt(module, save) {
  const path = statePath(save);
  return exists(module, path) ? module.FS.stat(path).mtime.getTime() : 0;
}
async function waitForState(module, save, since) {
  const deadline = performance.now() + WRITE_TIMEOUT_MS;
  while (stateModifiedAt(module, save) <= since) {
    if (performance.now() > deadline) {
      throw new Error("The emulator did not write the snapshot");
    }
    await new Promise((resolve2) => requestAnimationFrame(resolve2));
  }
}
function storeSnapshot(module, save, thumbnail) {
  const time = Date.now();
  const id = time.toString(36);
  module.FS.writeFile(statePath(save, id), module.FS.readFile(statePath(save)));
  const snapshots = [{
    id,
    time,
    thumbnail
  }, ...readSnapshots(module, save)];
  for (const {
    id: id2
  } of snapshots.slice(SNAPSHOT_LIMIT)) {
    module.FS.unlink(statePath(save, id2));
  }
  return writeSnapshots(module, save, snapshots.slice(0, SNAPSHOT_LIMIT));
}
function activateSnapshot(module, save, id) {
  module.FS.writeFile(statePath(save), module.FS.readFile(statePath(save, id)));
}
function deleteSnapshot(module, save, id) {
  module.FS.unlink(statePath(save, id));
  return writeSnapshots(module, save, readSnapshots(module, save).filter((snapshot2) => snapshot2.id !== id));
}
const isUnwindError = (err) => err === "unwind";
class GameboySession {
  constructor(module, pointer, save) {
    this.module = module;
    this.pointer = pointer;
    this.save = save;
  }
  static create(module, rom, save) {
    const pointer = module.ccall("gameboy_create", "number", ["string", "string"], [rom, save]);
    return pointer ? new GameboySession(module, pointer, save) : null;
  }
  start() {
    try {
      this.call("gameboy_start");
    } catch (err) {
      if (!isUnwindError(err)) throw err;
    }
  }
  button(button, pressed) {
    this.call("gameboy_button", BUTTONS[button], Number(pressed));
  }
  request(request) {
    this.call("gameboy_request", REQUESTS[request]);
  }
  configure(setting, value) {
    this.call("gameboy_configure", SETTINGS[setting], Number(value));
  }
  snapshots() {
    return readSnapshots(this.module, this.save);
  }
  async takeSnapshot(thumbnail) {
    const since = stateModifiedAt(this.module, this.save);
    this.request("saveState");
    await waitForState(this.module, this.save, since);
    return storeSnapshot(this.module, this.save, thumbnail);
  }
  restoreSnapshot(id) {
    activateSnapshot(this.module, this.save, id);
    this.request("loadState");
  }
  deleteSnapshot(id) {
    return deleteSnapshot(this.module, this.save, id);
  }
  rumble() {
    return Boolean(this.call("gameboy_rumble"));
  }
  isColor() {
    return Boolean(this.call("gameboy_color"));
  }
  destroy() {
    this.call("gameboy_destroy");
  }
  call(name, ...args) {
    return this.module.ccall(name, "number", ["number", ...args.map(() => "number")], [this.pointer, ...args]);
  }
}
function useEmscriptenModule(canvas) {
  const [instance, setInstance] = d$1(null);
  const [error, setError] = d$1(null);
  h$1(() => {
    if (!canvas || instance) return;
    let cancelled = false;
    (async () => {
      setError(null);
      try {
        const module = await import("./assets/gameboy-8KWh4XjG.mjs");
        if (cancelled) return;
        const moduleInstance = await module.default({
          canvas,
          locateFile: (path) => `/${path}`
        });
        await prepareFilesystem(moduleInstance);
        if (!cancelled) {
          setInstance(moduleInstance);
        }
      } catch (err) {
        if (!cancelled) {
          const error2 = err instanceof Error ? err : new Error(String(err));
          setError(error2);
          console.error("Failed to load Emscripten module:", error2);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [canvas, instance]);
  return {
    instance,
    error
  };
}
const nextFrame = () => new Promise((resolve2) => requestAnimationFrame(resolve2));
function useGameboyInitializer() {
  const [canvas, setCanvas] = d$1(null);
  const [currentGame, setCurrentGame] = d$1(null);
  const [session, setSession] = d$1(null);
  const [pendingGame, setPendingGame] = d$1(null);
  const [failure, setFailure] = d$1(null);
  const sessionRef = A$1(null);
  const {
    instance,
    error
  } = useEmscriptenModule(canvas);
  h$1(() => {
    setupVolumeControl();
    setCanvas(document.getElementById("canvas"));
  }, []);
  const loadGame = q$1(async (name, data) => {
    if (!instance) return;
    if (!isRomFile(name)) {
      setFailure("Only .gb and .gbc files can be opened");
      return;
    }
    setPendingGame(name);
    setFailure(null);
    try {
      const rom = data ?? (isValidGame(name) ? await fetchRom(name) : null);
      if (!rom) return;
      if (sessionRef.current) {
        sessionRef.current.destroy();
        sessionRef.current = null;
        setSession(null);
        await nextFrame();
      }
      const paths = installRom(instance, name, rom);
      const next = GameboySession.create(instance, paths.rom, paths.save);
      if (!next) throw new Error(`${name} is not a valid ROM`);
      next.start();
      sessionRef.current = next;
      setSession(next);
      setCurrentGame(name);
    } catch (err) {
      console.error("Failed to load game:", err);
      setFailure(`${formatGameName(name)} could not be loaded`);
    } finally {
      setPendingGame(null);
    }
  }, [instance]);
  const loadRomFile = q$1(async (file) => {
    await loadGame(sanitizeRomName(file.name), new Uint8Array(await file.arrayBuffer()));
  }, [loadGame]);
  h$1(() => {
    if (instance && !currentGame) loadGame(getGameToLoad());
  }, [instance, currentGame, loadGame]);
  const switchGame = q$1((game) => {
    if (!pendingGame && game !== currentGame) loadGame(game);
  }, [currentGame, pendingGame, loadGame]);
  return {
    loadedGame: currentGame ?? void 0,
    pendingGame: pendingGame ?? void 0,
    session,
    failure: error ? "The emulator could not start" : failure,
    switchGame,
    loadRomFile
  };
}
const $$_tpl_1 = ["<div ", " ", " ", " ", " ", ">", "", "<div ", "><div ", ">", "<div ", " ", "><canvas ", ' id="canvas" role="img" aria-label="Game screen" tabindex="-1" ', " ", " ", " ", "></canvas></div>", "</div>", "</div><div ", " ", ">", "", "</div></div>"];
const scaleStorage = createTypedStorage((v2) => v2 === "fit" ? v2 : Number(v2), String, (v2) => VALID_SCALES.includes(v2));
const themeStorage = createTypedStorage((v2) => v2, String, (v2) => THEMES.includes(v2));
const paletteStorage = createTypedStorage((v2) => v2, String, (v2) => PALETTES.includes(v2));
const handheldStorage = createTypedStorage((v2) => v2, String, (v2) => CASE_IDS.includes(v2));
const NOTICE_MS = 1800;
const NO_INSET = {
  width: 0,
  height: 0
};
const VOLUME_STEP = 0.1;
function Canvas() {
  const {
    loadedGame,
    pendingGame,
    session,
    failure,
    switchGame,
    loadRomFile
  } = useGameboyInitializer();
  const [scale, setScale] = usePersistedState(STORAGE_KEYS.scale, scaleStorage, "fit");
  const [volume, setVolume] = usePersistedState(STORAGE_KEYS.volume, numberStorage, DEFAULT_VOLUME);
  const [theme, setTheme] = usePersistedState(STORAGE_KEYS.theme, themeStorage, "light");
  const [showTiles, setShowTiles] = usePersistedState(STORAGE_KEYS.tiles, booleanStorage, false);
  const [palette, setPalette] = usePersistedState(STORAGE_KEYS.palette, paletteStorage, "gray");
  const [colorCorrection, setColorCorrection] = usePersistedState(STORAGE_KEYS.colorCorrection, booleanStorage, false);
  const [handheld, setHandheld] = usePersistedState(STORAGE_KEYS.handheld, handheldStorage, "classic");
  const [turbo, setTurbo] = d$1(false);
  const [panel, setPanel] = d$1(null);
  const [notice, setNotice] = d$1({
    text: "",
    visible: false
  });
  const canvasRef = A$1(null);
  const stageRef = A$1(null);
  const controlsRef = A$1(null);
  const touch = useMediaQuery("(pointer: coarse)");
  const preset = touch ? findCase(handheld) : null;
  const pageTheme = touch && !preset ? "auto" : theme;
  const pageColor = preset ? SURROUND : void 0;
  const {
    snapshots,
    saveSnapshot,
    restoreSnapshot,
    deleteSnapshot: deleteSnapshot2
  } = useSnapshots(session, canvasRef);
  useGamepad(session, setTurbo);
  usePlayback(session);
  usePageTheme(pageTheme, canvasRef, pageColor);
  h$1(() => {
    session?.configure("palette", PALETTES.indexOf(palette));
  }, [session, palette]);
  h$1(() => {
    session?.configure("colorCorrection", colorCorrection);
  }, [session, colorCorrection]);
  h$1(() => {
    session?.configure("turbo", turbo);
  }, [session, turbo]);
  h$1(() => {
    session?.configure("tiles", showTiles && !touch);
  }, [session, showTiles, touch]);
  h$1(() => {
    if (!notice.visible) return;
    const timeout = setTimeout(() => setNotice((current) => ({
      ...current,
      visible: false
    })), NOTICE_MS);
    return () => clearTimeout(timeout);
  }, [notice]);
  const announce = (text) => setNotice({
    text,
    visible: true
  });
  h$1(() => {
    if (failure) announce(failure);
  }, [failure]);
  const changeVolume = (step) => setVolume((current) => Math.min(1, Math.max(0, Math.round((current + step) * 10) / 10)));
  useShortcuts({
    " ": setTurbo,
    p: (pressed) => pressed && setPalette((current) => PALETTES[(PALETTES.indexOf(current) + 1) % PALETTES.length]),
    c: (pressed) => pressed && setColorCorrection((current) => !current),
    u: (pressed) => pressed && changeVolume(VOLUME_STEP),
    d: (pressed) => pressed && changeVolume(-VOLUME_STEP)
  });
  const handleSaveSnapshot = async () => {
    try {
      await saveSnapshot();
      announce("Snapshot saved");
    } catch {
      announce("Snapshot could not be saved");
    }
  };
  const handleRestoreSnapshot = (id) => {
    restoreSnapshot(id);
    announce("Snapshot restored");
  };
  const settings = {
    turbo,
    scale,
    theme,
    palette,
    colorCorrection,
    showTiles,
    handheld
  };
  const setters = {
    turbo: setTurbo,
    scale: setScale,
    theme: setTheme,
    palette: setPalette,
    colorCorrection: setColorCorrection,
    showTiles: setShowTiles,
    handheld: setHandheld
  };
  const changeSetting = (key, value) => setters[key](value);
  const openPanel = (name) => (open) => setPanel((current) => open ? name : current === name ? null : current);
  const handleButton = q$1((button, pressed) => {
    session?.button(button, pressed);
  }, [session]);
  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) loadRomFile(file);
  };
  h$1(() => {
    self.audioVolumeControl?.setVolume(volume);
  }, [volume]);
  const panelWidth = T(() => session?.isColor() === false ? CANVAS_DIMENSIONS.panelWidth / 2 : CANVAS_DIMENSIONS.panelWidth, [session]);
  const visibleWidth = CANVAS_DIMENSIONS.gameScreenWidth + (showTiles && !touch ? panelWidth : 0);
  const fittedScale = useFittedScale(scale, visibleWidth, CANVAS_DIMENSIONS.canvasHeight, stageRef, controlsRef, touch ? HANDHELD_INSET : NO_INSET);
  const currentGame = loadedGame ?? (typeof self !== "undefined" ? getCurrentGame() : null);
  const settingsMenu = u$2(SettingsMenu, {
    settings,
    touch,
    currentGame,
    pendingGame,
    onGameChange: switchGame,
    onRomFile: loadRomFile,
    volume,
    onVolumeChange: setVolume,
    onChange: changeSetting,
    snapshots,
    onSaveSnapshot: handleSaveSnapshot,
    onRestoreSnapshot: handleRestoreSnapshot,
    onDeleteSnapshot: deleteSnapshot2,
    open: panel === "settings",
    onOpenChange: openPanel("settings")
  });
  return a$2($$_tpl_1, l$2("ref", stageRef), l$2("class", touch ? `relative flex flex-col items-center w-full app-screen px-4 pt-[calc(env(safe-area-inset-top)+10px)] pb-[calc(env(safe-area-inset-bottom)+12px)] ${preset ? "" : "handheld-glass"}` : "flex flex-col items-center justify-center w-full app-screen px-3 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]"), l$2("style", preset ? {
    "--case": preset.body.join(" ")
  } : void 0), l$2("ondragover", (event) => event.preventDefault()), l$2("ondrop", handleDrop), s$2(touch && u$2(CaseBackdrop, {
    preset,
    canvasRef
  })), s$2(touch && u$2(CaseHeader, {
    preset,
    children: [u$2(Toast, {
      notice: notice.text,
      visible: notice.visible,
      side: "below"
    }), settingsMenu]
  })), l$2("class", touch ? "relative flex flex-col items-center w-full" : "flex items-center justify-center w-full min-h-0"), l$2("class", touch ? bezelClass(preset) : "contents"), s$2(touch && u$2(BezelHeader, {
    preset
  })), l$2("class", `overflow-hidden rounded-sm shrink-0 transition-opacity duration-300 ${pendingGame ? "opacity-50" : ""}`), l$2("style", {
    width: `${visibleWidth * fittedScale}px`,
    height: `${CANVAS_DIMENSIONS.canvasHeight * fittedScale}px`
  }), l$2("ref", canvasRef), l$2("width", CANVAS_DIMENSIONS.canvasWidth), l$2("height", CANVAS_DIMENSIONS.canvasHeight), l$2("oncontextmenu", (evt) => evt.preventDefault()), l$2("style", {
    width: `${CANVAS_DIMENSIONS.canvasWidth * fittedScale}px`,
    height: `${CANVAS_DIMENSIONS.canvasHeight * fittedScale}px`,
    maxWidth: "none",
    imageRendering: "pixelated",
    display: "block",
    outline: "none"
  }), s$2(touch && u$2(BezelFooter, {
    preset
  })), s$2(touch && u$2(Branding, {
    preset
  })), l$2("ref", controlsRef), l$2("class", touch ? "relative flex flex-col items-center w-full shrink-0 my-auto pb-6" : "flex flex-col items-center gap-4 pt-5 shrink-0 max-w-full"), u$2(TouchControls, {
    onButton: handleButton,
    preset: preset ?? DYNAMIC_CONTROLS
  }), s$2(!touch && u$2(Dock, {
    notice: notice.text,
    showNotice: notice.visible,
    children: [u$2(GameSelector, {
      currentGame,
      pendingGame,
      onGameChange: switchGame,
      onRomFile: loadRomFile,
      open: panel === "games",
      onOpenChange: openPanel("games")
    }), u$2(DockDivider, null), u$2(VolumeControl, {
      volume,
      onVolumeChange: setVolume
    }), u$2(DockDivider, null), settingsMenu]
  })));
}
const Canvas$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Canvas
}, Symbol.toStringTag, { value: "Module" }));
const ogImage = "/assets/web-ui-BXgOqnZ5.png";
function App({
  Component,
  url
}) {
  const ogImageUrl = new URL(ogImage, url).href;
  return u$2("html", {
    lang: "en",
    children: [u$2("head", {
      children: [u$2("meta", {
        charset: "utf-8"
      }), u$2("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
      }), u$2("title", {
        children: "Gameboy"
      }), u$2("meta", {
        name: "description",
        content: "An accurate gameboy emulator written in C from scratch with a Deno web interface"
      }), u$2("meta", {
        property: "og:type",
        content: "website"
      }), u$2("meta", {
        property: "og:url",
        content: "https://gameboy.monad.deno.net/"
      }), u$2("meta", {
        property: "og:title",
        content: "Gameboy Emulator"
      }), u$2("meta", {
        property: "og:description",
        content: "An accurate gameboy emulator written in C from scratch with a Deno web interface"
      }), u$2("meta", {
        property: "og:image",
        content: ogImageUrl
      }), u$2("meta", {
        property: "og:image:type",
        content: "image/png"
      }), u$2("meta", {
        property: "og:image:width",
        content: "1200"
      }), u$2("meta", {
        property: "og:image:height",
        content: "721"
      }), u$2("meta", {
        name: "twitter:card",
        content: "summary_large_image"
      }), u$2("meta", {
        name: "twitter:url",
        content: "https://gameboy.monad.deno.net/"
      }), u$2("meta", {
        name: "twitter:title",
        content: "Gameboy Emulator"
      }), u$2("meta", {
        name: "twitter:description",
        content: "An accurate gameboy emulator written in C from scratch with a Deno web interface"
      }), u$2("meta", {
        name: "twitter:image",
        content: ogImageUrl
      }), u$2("meta", {
        name: "theme-color",
        content: "#ffffff"
      }), u$2("meta", {
        name: "mobile-web-app-capable",
        content: "yes"
      }), u$2("meta", {
        name: "apple-mobile-web-app-capable",
        content: "yes"
      }), u$2("meta", {
        name: "apple-mobile-web-app-status-bar-style",
        content: "black-translucent"
      }), u$2("link", {
        rel: "manifest",
        href: "/manifest.webmanifest"
      }), u$2("link", {
        rel: "icon",
        href: "/favicon.ico",
        sizes: "48x48"
      }), u$2("link", {
        rel: "icon",
        href: "/icon.svg",
        type: "image/svg+xml"
      }), u$2("link", {
        rel: "apple-touch-icon",
        href: "/apple-touch-icon.png"
      })]
    }), u$2("body", {
      children: u$2(Component, null)
    })]
  });
}
const routeCss = ["__FRESH_CSS_PLACEHOLDER__"];
const css = routeCss;
const config = void 0;
const handler = void 0;
const handlers = void 0;
const _freshRoute____app = App;
const fsRoute_0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  config,
  css,
  default: _freshRoute____app,
  handler,
  handlers
}, Symbol.toStringTag, { value: "Module" }));
const clientEntry = "./assets/client-entry-C_csSsFk.js";
const version$1 = "fd48e6ddb5520bafe518b15f5cb3cd93d94369bb";
const islands = /* @__PURE__ */ new Map();
const islandPreparer = new IslandPreparer();
islandPreparer.prepare(islands, Canvas$1, "/assets/fresh-island__Canvas-Cz6lxTPn.js", "Canvas", []);
const staticFiles$1 = /* @__PURE__ */ new Map([
  ["/assets/hooks.module-CtKKkkha.js", { "name": "/assets/hooks.module-CtKKkkha.js", "hash": "91d95b9c3f73e5a19593dc2af14987b0de34732296cae0a73d78914bfef74def", "filePath": "client/assets/hooks.module-CtKKkkha.js", "contentType": "text/javascript; charset=UTF-8", "immutable": true }],
  ["/assets/client-entry-C_csSsFk.js", { "name": "/assets/client-entry-C_csSsFk.js", "hash": "670be932838b1faade5b8992367117a4533a5b48cee683b67a878d7a4a803586", "filePath": "client/assets/client-entry-C_csSsFk.js", "contentType": "text/javascript; charset=UTF-8", "immutable": true }],
  ["/assets/client-entry-BhchZsG4.css", { "name": "/assets/client-entry-BhchZsG4.css", "hash": "787c54daa42d552345b5c534f28ab7daf2929f0bff3f7eb9a6b72c698d395836", "filePath": "client/assets/client-entry-BhchZsG4.css", "contentType": "text/css; charset=UTF-8", "immutable": true }],
  ["/assets/fresh-island__Canvas-Cz6lxTPn.js", { "name": "/assets/fresh-island__Canvas-Cz6lxTPn.js", "hash": "259499dae6d52d1075490cc29e801be4db871fc1479b7309ba2730b3ec72c5d3", "filePath": "client/assets/fresh-island__Canvas-Cz6lxTPn.js", "contentType": "text/javascript; charset=UTF-8", "immutable": true }],
  ["/assets/gameboy-42JYBtp9.js", { "name": "/assets/gameboy-42JYBtp9.js", "hash": "f11089ff780d0a78f823e55cff9f2e9842f735b25f6d1c1fe054bff0fdc595fe", "filePath": "client/assets/gameboy-42JYBtp9.js", "contentType": "text/javascript; charset=UTF-8", "immutable": true }],
  ["/assets/web-ui-BXgOqnZ5.png", { "name": "/assets/web-ui-BXgOqnZ5.png", "hash": "171a9c9a61b1caef519cae3f2cef4e8add380bfc2b718839a08ebf233588d489", "filePath": "client/assets/web-ui-BXgOqnZ5.png", "contentType": "image/png", "immutable": true }],
  ["/web-ui.png", { "name": "/web-ui.png", "hash": "171a9c9a61b1caef519cae3f2cef4e8add380bfc2b718839a08ebf233588d489", "filePath": "client/web-ui.png", "contentType": "image/png" }],
  ["/logo.svg", { "name": "/logo.svg", "hash": "bf1196aeac0c511ec4b81b846993de208012c4158fba73d17b575236164d63ce", "filePath": "client/logo.svg", "contentType": "image/svg+xml" }],
  ["/styles.css", { "name": "/styles.css", "hash": "8be673e0252fd91f7497da61a6abca73a91d9de8f1d65e2120b55d5e264c1281", "filePath": "client/styles.css", "contentType": "text/css; charset=UTF-8" }],
  ["/manifest.webmanifest", { "name": "/manifest.webmanifest", "hash": "a0946c3d90c7cc2a05c12d50c9678700293b11872b0713fc5dec2438862a1e24", "filePath": "client/manifest.webmanifest", "contentType": "application/manifest+json; charset=UTF-8" }],
  ["/favicon.ico", { "name": "/favicon.ico", "hash": "b98df70fba4f3c654b6b66aaeacc2a4f560ef52d243eda1abef109ad23b8804c", "filePath": "client/favicon.ico", "contentType": "image/vnd.microsoft.icon" }],
  ["/gameboy.js", { "name": "/gameboy.js", "hash": "82e456e18a01d80bed171ade8a8263bb925b214363b0d868eeb0a1483864e692", "filePath": "client/gameboy.js", "contentType": "text/javascript; charset=UTF-8" }],
  ["/sw.js", { "name": "/sw.js", "hash": "b11c52139d9e8a877e3b47cbf2e40166774a8cdb9b524dc956ea27f013739549", "filePath": "client/sw.js", "contentType": "text/javascript; charset=UTF-8" }],
  ["/icon.svg", { "name": "/icon.svg", "hash": "c84c6a1bf26deb87b556e148b41f1610ccb29c53eae2bf6cbe887b75c1c29d31", "filePath": "client/icon.svg", "contentType": "image/svg+xml" }],
  ["/icon-512.png", { "name": "/icon-512.png", "hash": "2b0d9a69be03aaf3d892c71f68823215d5e6ed63c85f89e63e184468b0782181", "filePath": "client/icon-512.png", "contentType": "image/png" }],
  ["/apple-touch-icon.png", { "name": "/apple-touch-icon.png", "hash": "74776fc8b8702bcffb007015631c22d83cf438888e7c67d125d58706fcc3b70d", "filePath": "client/apple-touch-icon.png", "contentType": "image/png" }],
  ["/icon-192.png", { "name": "/icon-192.png", "hash": "a0c49e968d23f3b2d4feb9c4359c0501f50302713c30f29aaab470a678837f56", "filePath": "client/icon-192.png", "contentType": "image/png" }],
  ["/gameboy.wasm", { "name": "/gameboy.wasm", "hash": "02198cc7ea0a9e20d404014725527d712241a6b373b917919014de8f41b96ed4", "filePath": "client/gameboy.wasm", "contentType": "application/wasm" }]
]);
const entryAssets = ["/assets/client-entry-BhchZsG4.css"];
const fsRoutes = [
  { id: "/_app", mod: fsRoute_0, type: "app", pattern: "*", routePattern: "*" },
  { id: "/index", mod: () => import("./assets/_fresh-route___index-DnkBZS6a.mjs"), type: "route", pattern: "/", routePattern: "/" }
];
const snapshot = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  clientEntry,
  entryAssets,
  fsRoutes,
  islands,
  staticFiles: staticFiles$1,
  version: version$1
}, Symbol.toStringTag, { value: "Module" }));
const KEY_VALUE_REGEXP = /^\s*(?:export\s+)?(?<key>[^\s=#]+?)\s*=[\ \t]*('\r?\n?(?<notInterpolated>(.|\r\n|\n)*?)\r?\n?'|"\r?\n?(?<interpolated>(?:[^"\\]|\\[\s\S])*?)\r?\n?"|(?<unquoted>[^\r\n#]*)) *#*.*$/gm;
const VALID_KEY_REGEXP = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
const EXPAND_VALUE_REGEXP = new RegExp("(\\${(?<inBrackets>.+?)(\\:-(?<inBracketsDefault>.+))?}|(?<!\\\\)\\$(?<notInBrackets>\\w+)(\\:-(?<notInBracketsDefault>.+))?)", "g");
const CHARACTERS_MAP = {
  "\\n": "\n",
  "\\r": "\r",
  "\\t": "	",
  '\\"': '"',
  "\\'": "'",
  "\\\\": "\\"
};
function expandCharacters(str) {
  return str.replace(/\\[\s\S]/g, (match) => CHARACTERS_MAP[match] ?? match);
}
function expand(str, variablesMap) {
  let current = str;
  while (EXPAND_VALUE_REGEXP.test(current)) {
    current = current.replace(EXPAND_VALUE_REGEXP, (...params) => {
      const {
        inBrackets,
        inBracketsDefault,
        notInBrackets,
        notInBracketsDefault
      } = params.at(-1);
      const expandValue = inBrackets ?? notInBrackets;
      const defaultValue = inBracketsDefault ?? notInBracketsDefault;
      return variablesMap[expandValue] ?? Deno.env.get(expandValue) ?? defaultValue;
    });
  }
  return current;
}
function parse(text) {
  const env = /* @__PURE__ */ Object.create(null);
  const keysForExpandCheck = [];
  for (const match of text.matchAll(KEY_VALUE_REGEXP)) {
    const {
      key,
      interpolated,
      notInterpolated,
      unquoted
    } = match?.groups;
    if (!VALID_KEY_REGEXP.test(key)) {
      console.warn(`Ignored the key "${key}" as it is not a valid identifier: The key need to match the pattern /^[a-zA-Z_][a-zA-Z0-9_]*$/.`);
      continue;
    }
    if (unquoted) {
      keysForExpandCheck.push(key);
    }
    env[key] = typeof notInterpolated === "string" ? notInterpolated : typeof interpolated === "string" ? expandCharacters(interpolated) : unquoted.trim();
  }
  const variablesMap = {
    ...env
  };
  for (const key of keysForExpandCheck) {
    env[key] = expand(env[key], variablesMap);
  }
  return env;
}
function loadSync(options2 = {}) {
  const {
    envPath = ".env",
    export: _export = false
  } = options2;
  const conf = envPath ? parseFileSync(envPath) : {};
  if (_export) {
    for (const [key, value] of Object.entries(conf)) {
      if (Deno.env.get(key) !== void 0) continue;
      Deno.env.set(key, value);
    }
  }
  return conf;
}
function parseFileSync(filepath) {
  try {
    return parse(Deno.readTextFileSync(filepath));
  } catch (e2) {
    if (e2 instanceof Deno.errors.NotFound) return {};
    throw e2;
  }
}
if (!(Deno.readTextFileSync instanceof Function)) {
  console.warn(`Deno.readTextFileSync is not a function: No .env data was read.`);
} else {
  loadSync({
    export: true
  });
}
function normalizePathname(pathname) {
  return "/" + pathname.split("/").filter(Boolean).map(encodeURIComponent).join("/");
}
function staticFiles() {
  return async function freshServeStaticFiles(ctx) {
    const {
      req,
      url,
      config: config2
    } = ctx;
    const buildCache = getBuildCache(ctx);
    if (buildCache === null) return await ctx.next();
    let pathname = url.pathname;
    if (config2.basePath) {
      pathname = pathname !== config2.basePath ? pathname.slice(config2.basePath.length) : "/";
    }
    try {
      pathname = normalizePathname(decodeURIComponent(pathname));
    } catch (_e) {
      if (!(_e instanceof URIError)) throw _e;
      return await ctx.next();
    }
    const startTime = performance.now() + performance.timeOrigin;
    const file = await buildCache.readFile(pathname);
    if (pathname === "/" || file === null) {
      if (pathname === "/favicon.ico") {
        return new Response(null, {
          status: 404
        });
      }
      return await ctx.next();
    }
    if (req.method !== "GET" && req.method !== "HEAD") {
      file.close();
      return new Response("Method Not Allowed", {
        status: 405
      });
    }
    const span = tracer.startSpan("static file", {
      attributes: {
        "fresh.span_type": "static_file"
      },
      startTime
    });
    try {
      const cacheKey = url.searchParams.get(ASSET_CACHE_BUST_KEY);
      if (cacheKey !== null && BUILD_ID !== cacheKey) {
        url.searchParams.delete(ASSET_CACHE_BUST_KEY);
        const location = url.pathname + url.search;
        file.close();
        span.setAttribute("fresh.cache", "invalid_bust_key");
        span.setAttribute("fresh.cache_key", cacheKey);
        return new Response(null, {
          status: 307,
          headers: {
            location
          }
        });
      }
      const etag = file.hash;
      const headers = new Headers({
        "Content-Type": file.contentType,
        vary: "If-None-Match"
      });
      if (ctx.config.mode !== "development") {
        const ifNoneMatch2 = req.headers.get("If-None-Match");
        if (ifNoneMatch2 !== null && (ifNoneMatch2 === etag || ifNoneMatch2 === `W/"${etag}"`)) {
          file.close();
          span.setAttribute("fresh.cache", "not_modified");
          return new Response(null, {
            status: 304,
            headers
          });
        } else if (etag !== null) {
          headers.set("Etag", `W/"${etag}"`);
        }
      }
      if (ctx.config.mode !== "development" && (BUILD_ID === cacheKey || url.pathname.startsWith(`${ctx.config.basePath}/_fresh/js/${BUILD_ID}/`) || file.immutable)) {
        span.setAttribute("fresh.cache", "immutable");
        headers.append("Cache-Control", "public, max-age=31536000, immutable");
      } else {
        span.setAttribute("fresh.cache", "no_cache");
        headers.append("Cache-Control", "no-cache, no-store, max-age=0, must-revalidate");
      }
      headers.set("Content-Length", String(file.size));
      if (req.method === "HEAD") {
        file.close();
        return new Response(null, {
          status: 200,
          headers
        });
      }
      return new Response(file.readable, {
        headers
      });
    } finally {
      span.end();
    }
  };
}
const policy = async (ctx) => {
  const resp = await ctx.next();
  resp.headers.set("Cross-Origin-Embedder-Policy", "require-corp");
  resp.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  resp.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  return resp;
};
function splitPieces(str) {
  const regexp = new RegExp("[^\\p{Lu}_\\-\\s]+|\\p{Lu}+(?![^\\p{Lu}_\\-\\s])|\\p{Lu}[^\\p{Lu}_\\-\\s]*", "gu");
  return Array.from(str.matchAll(regexp), (m2) => m2[0]);
}
function snakeCase(str) {
  const pieces = Array.isArray(str) ? str : splitPieces(str);
  return pieces.map((s2) => s2.toLowerCase()).join("_");
}
function getCookies(headers) {
  const cookie = headers.get("Cookie");
  if (cookie !== null) {
    const out = {};
    const c2 = cookie.split(";");
    for (const kv of c2) {
      const [cookieKey, ...cookieVal] = kv.split("=");
      if (cookieKey === void 0) {
        throw new TypeError("Cookie cannot start with '='");
      }
      const key = cookieKey.trim();
      out[key] = cookieVal.join("=");
    }
    return out;
  }
  return {};
}
const encoder$3 = new TextEncoder();
function getTypeName(value) {
  const type = typeof value;
  if (type !== "object") {
    return type;
  } else if (value === null) {
    return "null";
  } else {
    return value?.constructor?.name ?? "object";
  }
}
function validateBinaryLike(source) {
  if (typeof source === "string") {
    return encoder$3.encode(source);
  } else if (source instanceof Uint8Array) {
    return source;
  } else if (source instanceof ArrayBuffer) {
    return new Uint8Array(source);
  }
  throw new TypeError(`The input must be a Uint8Array, a string, or an ArrayBuffer. Received a value of the type ${getTypeName(source)}.`);
}
const base64abc = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "+", "/"];
function encodeBase64(data) {
  const uint8 = validateBinaryLike(data);
  let result = "";
  let i2;
  const l2 = uint8.length;
  for (i2 = 2; i2 < l2; i2 += 3) {
    result += base64abc[uint8[i2 - 2] >> 2];
    result += base64abc[(uint8[i2 - 2] & 3) << 4 | uint8[i2 - 1] >> 4];
    result += base64abc[(uint8[i2 - 1] & 15) << 2 | uint8[i2] >> 6];
    result += base64abc[uint8[i2] & 63];
  }
  if (i2 === l2 + 1) {
    result += base64abc[uint8[i2 - 2] >> 2];
    result += base64abc[(uint8[i2 - 2] & 3) << 4];
    result += "==";
  }
  if (i2 === l2) {
    result += base64abc[uint8[i2 - 2] >> 2];
    result += base64abc[(uint8[i2 - 2] & 3) << 4 | uint8[i2 - 1] >> 4];
    result += base64abc[(uint8[i2 - 1] & 15) << 2];
    result += "=";
  }
  return result;
}
const encoder$2 = new TextEncoder();
const DEFAULT_ALGORITHM = "SHA-256";
function isFileInfo(value) {
  return Boolean(value && typeof value === "object" && "mtime" in value && "size" in value);
}
async function calcEntity(entity, {
  algorithm = DEFAULT_ALGORITHM
}) {
  if (entity.length === 0) {
    return `0-47DEQpj8HBSa+/TImW+5JCeuQeR`;
  }
  if (typeof entity === "string") {
    entity = encoder$2.encode(entity);
  }
  const hash = encodeBase64(await crypto.subtle.digest(algorithm, entity)).substring(0, 27);
  return `${entity.length.toString(16)}-${hash}`;
}
async function calcFileInfo(fileInfo, {
  algorithm = DEFAULT_ALGORITHM
}) {
  if (fileInfo.mtime) {
    const hash = encodeBase64(await crypto.subtle.digest(algorithm, encoder$2.encode(fileInfo.mtime.toJSON()))).substring(0, 27);
    return `${fileInfo.size.toString(16)}-${hash}`;
  }
}
async function calculate(entity, options2 = {}) {
  const weak = options2.weak ?? isFileInfo(entity);
  const tag = await (isFileInfo(entity) ? calcFileInfo(entity, options2) : calcEntity(entity, options2));
  return tag ? weak ? `W/"${tag}"` : `"${tag}"` : void 0;
}
function ifNoneMatch(value, etag) {
  if (!value || !etag) {
    return true;
  }
  if (value.trim() === "*") {
    return false;
  }
  etag = etag.startsWith("W/") ? etag.slice(2) : etag;
  const tags = value.split(/\s*,\s*/).map((tag) => tag.startsWith("W/") ? tag.slice(2) : tag);
  return !tags.includes(etag);
}
const STATUS_CODE = {
  /** RFC 7231, 6.2.1 */
  Continue: 100,
  /** RFC 7231, 6.2.2 */
  SwitchingProtocols: 101,
  /** RFC 2518, 10.1 */
  Processing: 102,
  /** RFC 8297 **/
  EarlyHints: 103,
  /** RFC 7231, 6.3.1 */
  OK: 200,
  /** RFC 7231, 6.3.2 */
  Created: 201,
  /** RFC 7231, 6.3.3 */
  Accepted: 202,
  /** RFC 7231, 6.3.4 */
  NonAuthoritativeInfo: 203,
  /** RFC 7231, 6.3.5 */
  NoContent: 204,
  /** RFC 7231, 6.3.6 */
  ResetContent: 205,
  /** RFC 7233, 4.1 */
  PartialContent: 206,
  /** RFC 4918, 11.1 */
  MultiStatus: 207,
  /** RFC 5842, 7.1 */
  AlreadyReported: 208,
  /** RFC 3229, 10.4.1 */
  IMUsed: 226,
  /** RFC 7231, 6.4.1 */
  MultipleChoices: 300,
  /** RFC 7231, 6.4.2 */
  MovedPermanently: 301,
  /** RFC 7231, 6.4.3 */
  Found: 302,
  /** RFC 7231, 6.4.4 */
  SeeOther: 303,
  /** RFC 7232, 4.1 */
  NotModified: 304,
  /** RFC 7231, 6.4.5 */
  UseProxy: 305,
  /** RFC 7231, 6.4.7 */
  TemporaryRedirect: 307,
  /** RFC 7538, 3 */
  PermanentRedirect: 308,
  /** RFC 7231, 6.5.1 */
  BadRequest: 400,
  /** RFC 7235, 3.1 */
  Unauthorized: 401,
  /** RFC 7231, 6.5.2 */
  PaymentRequired: 402,
  /** RFC 7231, 6.5.3 */
  Forbidden: 403,
  /** RFC 7231, 6.5.4 */
  NotFound: 404,
  /** RFC 7231, 6.5.5 */
  MethodNotAllowed: 405,
  /** RFC 7231, 6.5.6 */
  NotAcceptable: 406,
  /** RFC 7235, 3.2 */
  ProxyAuthRequired: 407,
  /** RFC 7231, 6.5.7 */
  RequestTimeout: 408,
  /** RFC 7231, 6.5.8 */
  Conflict: 409,
  /** RFC 7231, 6.5.9 */
  Gone: 410,
  /** RFC 7231, 6.5.10 */
  LengthRequired: 411,
  /** RFC 7232, 4.2 */
  PreconditionFailed: 412,
  /** RFC 7231, 6.5.11 */
  ContentTooLarge: 413,
  /** RFC 7231, 6.5.12 */
  URITooLong: 414,
  /** RFC 7231, 6.5.13 */
  UnsupportedMediaType: 415,
  /** RFC 7233, 4.4 */
  RangeNotSatisfiable: 416,
  /** RFC 7231, 6.5.14 */
  ExpectationFailed: 417,
  /** RFC 7168, 2.3.3 */
  Teapot: 418,
  /** RFC 7540, 9.1.2 */
  MisdirectedRequest: 421,
  /** RFC 4918, 11.2 */
  UnprocessableEntity: 422,
  /** RFC 4918, 11.3 */
  Locked: 423,
  /** RFC 4918, 11.4 */
  FailedDependency: 424,
  /** RFC 8470, 5.2 */
  TooEarly: 425,
  /** RFC 7231, 6.5.15 */
  UpgradeRequired: 426,
  /** RFC 6585, 3 */
  PreconditionRequired: 428,
  /** RFC 6585, 4 */
  TooManyRequests: 429,
  /** RFC 6585, 5 */
  RequestHeaderFieldsTooLarge: 431,
  /** RFC 7725, 3 */
  UnavailableForLegalReasons: 451,
  /** RFC 7231, 6.6.1 */
  InternalServerError: 500,
  /** RFC 7231, 6.6.2 */
  NotImplemented: 501,
  /** RFC 7231, 6.6.3 */
  BadGateway: 502,
  /** RFC 7231, 6.6.4 */
  ServiceUnavailable: 503,
  /** RFC 7231, 6.6.5 */
  GatewayTimeout: 504,
  /** RFC 7231, 6.6.6 */
  HTTPVersionNotSupported: 505,
  /** RFC 2295, 8.1 */
  VariantAlsoNegotiates: 506,
  /** RFC 4918, 11.5 */
  InsufficientStorage: 507,
  /** RFC 5842, 7.2 */
  LoopDetected: 508,
  /** RFC 2774, 7 */
  NotExtended: 510,
  /** RFC 6585, 6 */
  NetworkAuthenticationRequired: 511
};
const STATUS_TEXT = {
  [STATUS_CODE.Accepted]: "Accepted",
  [STATUS_CODE.AlreadyReported]: "Already Reported",
  [STATUS_CODE.BadGateway]: "Bad Gateway",
  [STATUS_CODE.BadRequest]: "Bad Request",
  [STATUS_CODE.Conflict]: "Conflict",
  [STATUS_CODE.Continue]: "Continue",
  [STATUS_CODE.Created]: "Created",
  [STATUS_CODE.EarlyHints]: "Early Hints",
  [STATUS_CODE.ExpectationFailed]: "Expectation Failed",
  [STATUS_CODE.FailedDependency]: "Failed Dependency",
  [STATUS_CODE.Forbidden]: "Forbidden",
  [STATUS_CODE.Found]: "Found",
  [STATUS_CODE.GatewayTimeout]: "Gateway Timeout",
  [STATUS_CODE.Gone]: "Gone",
  [STATUS_CODE.HTTPVersionNotSupported]: "HTTP Version Not Supported",
  [STATUS_CODE.IMUsed]: "IM Used",
  [STATUS_CODE.InsufficientStorage]: "Insufficient Storage",
  [STATUS_CODE.InternalServerError]: "Internal Server Error",
  [STATUS_CODE.LengthRequired]: "Length Required",
  [STATUS_CODE.Locked]: "Locked",
  [STATUS_CODE.LoopDetected]: "Loop Detected",
  [STATUS_CODE.MethodNotAllowed]: "Method Not Allowed",
  [STATUS_CODE.MisdirectedRequest]: "Misdirected Request",
  [STATUS_CODE.MovedPermanently]: "Moved Permanently",
  [STATUS_CODE.MultiStatus]: "Multi Status",
  [STATUS_CODE.MultipleChoices]: "Multiple Choices",
  [STATUS_CODE.NetworkAuthenticationRequired]: "Network Authentication Required",
  [STATUS_CODE.NoContent]: "No Content",
  [STATUS_CODE.NonAuthoritativeInfo]: "Non Authoritative Info",
  [STATUS_CODE.NotAcceptable]: "Not Acceptable",
  [STATUS_CODE.NotExtended]: "Not Extended",
  [STATUS_CODE.NotFound]: "Not Found",
  [STATUS_CODE.NotImplemented]: "Not Implemented",
  [STATUS_CODE.NotModified]: "Not Modified",
  [STATUS_CODE.OK]: "OK",
  [STATUS_CODE.PartialContent]: "Partial Content",
  [STATUS_CODE.PaymentRequired]: "Payment Required",
  [STATUS_CODE.PermanentRedirect]: "Permanent Redirect",
  [STATUS_CODE.PreconditionFailed]: "Precondition Failed",
  [STATUS_CODE.PreconditionRequired]: "Precondition Required",
  [STATUS_CODE.Processing]: "Processing",
  [STATUS_CODE.ProxyAuthRequired]: "Proxy Auth Required",
  [STATUS_CODE.ContentTooLarge]: "Content Too Large",
  [STATUS_CODE.RequestHeaderFieldsTooLarge]: "Request Header Fields Too Large",
  [STATUS_CODE.RequestTimeout]: "Request Timeout",
  [STATUS_CODE.URITooLong]: "URI Too Long",
  [STATUS_CODE.RangeNotSatisfiable]: "Range Not Satisfiable",
  [STATUS_CODE.ResetContent]: "Reset Content",
  [STATUS_CODE.SeeOther]: "See Other",
  [STATUS_CODE.ServiceUnavailable]: "Service Unavailable",
  [STATUS_CODE.SwitchingProtocols]: "Switching Protocols",
  [STATUS_CODE.Teapot]: "I'm a teapot",
  [STATUS_CODE.TemporaryRedirect]: "Temporary Redirect",
  [STATUS_CODE.TooEarly]: "Too Early",
  [STATUS_CODE.TooManyRequests]: "Too Many Requests",
  [STATUS_CODE.Unauthorized]: "Unauthorized",
  [STATUS_CODE.UnavailableForLegalReasons]: "Unavailable For Legal Reasons",
  [STATUS_CODE.UnprocessableEntity]: "Unprocessable Entity",
  [STATUS_CODE.UnsupportedMediaType]: "Unsupported Media Type",
  [STATUS_CODE.UpgradeRequired]: "Upgrade Required",
  [STATUS_CODE.UseProxy]: "Use Proxy",
  [STATUS_CODE.VariantAlsoNegotiates]: "Variant Also Negotiates"
};
function isStatus(status) {
  return Object.values(STATUS_CODE).includes(status);
}
function isRedirectStatus(status) {
  return isStatus(status) && status >= 300 && status < 400;
}
new TextEncoder().encode("0123456789abcdef");
new TextEncoder();
new TextDecoder();
new TextEncoder();
const NEWLINE_REGEXP = /\r\n|\r|\n/;
const encoder$1 = new TextEncoder();
function assertHasNoNewline(value, varName) {
  if (value.match(NEWLINE_REGEXP) !== null) {
    throw new RangeError(`${varName} cannot contain a newline`);
  }
}
function stringify(message) {
  const lines = [];
  if (message.comment) {
    assertHasNoNewline(message.comment, "`message.comment`");
    lines.push(`:${message.comment}`);
  }
  if (message.event) {
    assertHasNoNewline(message.event, "`message.event`");
    lines.push(`event:${message.event}`);
  }
  if (message.data) {
    message.data.split(NEWLINE_REGEXP).forEach((line) => lines.push(`data:${line}`));
  }
  if (message.id) {
    assertHasNoNewline(message.id.toString(), "`message.id`");
    lines.push(`id:${message.id}`);
  }
  if (message.retry) lines.push(`retry:${message.retry}`);
  return encoder$1.encode(lines.join("\n") + "\n\n");
}
class ServerSentEventStream extends TransformStream {
  constructor() {
    super({
      transform: (message, controller) => {
        controller.enqueue(stringify(message));
      }
    });
  }
}
function assertPath(path) {
  if (typeof path !== "string") {
    throw new TypeError(`Path must be a string. Received ${JSON.stringify(path)}`);
  }
}
function assertArg(path) {
  assertPath(path);
  if (path.length === 0) return ".";
}
const CHAR_UPPERCASE_A = 65;
const CHAR_LOWERCASE_A = 97;
const CHAR_UPPERCASE_Z = 90;
const CHAR_LOWERCASE_Z = 122;
const CHAR_DOT = 46;
const CHAR_FORWARD_SLASH = 47;
const CHAR_BACKWARD_SLASH = 92;
const CHAR_COLON = 58;
function normalizeString(path, allowAboveRoot, separator, isPathSeparator2) {
  let res = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let code2;
  for (let i2 = 0; i2 <= path.length; ++i2) {
    if (i2 < path.length) code2 = path.charCodeAt(i2);
    else if (isPathSeparator2(code2)) break;
    else code2 = CHAR_FORWARD_SLASH;
    if (isPathSeparator2(code2)) {
      if (lastSlash === i2 - 1 || dots === 1) ;
      else if (lastSlash !== i2 - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== CHAR_DOT || res.charCodeAt(res.length - 2) !== CHAR_DOT) {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf(separator);
            if (lastSlashIndex === -1) {
              res = "";
              lastSegmentLength = 0;
            } else {
              res = res.slice(0, lastSlashIndex);
              lastSegmentLength = res.length - 1 - res.lastIndexOf(separator);
            }
            lastSlash = i2;
            dots = 0;
            continue;
          } else if (res.length === 2 || res.length === 1) {
            res = "";
            lastSegmentLength = 0;
            lastSlash = i2;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0) res += `${separator}..`;
          else res = "..";
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) res += separator + path.slice(lastSlash + 1, i2);
        else res = path.slice(lastSlash + 1, i2);
        lastSegmentLength = i2 - lastSlash - 1;
      }
      lastSlash = i2;
      dots = 0;
    } else if (code2 === CHAR_DOT && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}
function isPosixPathSeparator(code2) {
  return code2 === CHAR_FORWARD_SLASH;
}
function normalize$1(path) {
  assertArg(path);
  const isAbsolute2 = isPosixPathSeparator(path.charCodeAt(0));
  const trailingSeparator = isPosixPathSeparator(path.charCodeAt(path.length - 1));
  path = normalizeString(path, !isAbsolute2, "/", isPosixPathSeparator);
  if (path.length === 0 && !isAbsolute2) path = ".";
  if (path.length > 0 && trailingSeparator) path += "/";
  if (isAbsolute2) return `/${path}`;
  return path;
}
function join$2(...paths) {
  if (paths.length === 0) return ".";
  paths.forEach((path) => assertPath(path));
  const joined = paths.filter((path) => path.length > 0).join("/");
  return joined === "" ? "." : normalize$1(joined);
}
function getOsType() {
  return globalThis.Deno?.build.os || (navigator.userAgent.includes("Win") ? "windows" : "linux");
}
const isWindows = getOsType() === "windows";
function extname$2(path) {
  assertPath(path);
  let startDot = -1;
  let startPart = 0;
  let end = -1;
  let matchedSlash = true;
  let preDotState = 0;
  for (let i2 = path.length - 1; i2 >= 0; --i2) {
    const code2 = path.charCodeAt(i2);
    if (isPosixPathSeparator(code2)) {
      if (!matchedSlash) {
        startPart = i2 + 1;
        break;
      }
      continue;
    }
    if (end === -1) {
      matchedSlash = false;
      end = i2 + 1;
    }
    if (code2 === CHAR_DOT) {
      if (startDot === -1) startDot = i2;
      else if (preDotState !== 1) preDotState = 1;
    } else if (startDot !== -1) {
      preDotState = -1;
    }
  }
  if (startDot === -1 || end === -1 || // We saw a non-dot character immediately before the dot
  preDotState === 0 || // The (right-most) trimmed path component is exactly '..'
  preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
    return "";
  }
  return path.slice(startDot, end);
}
function isPathSeparator(code2) {
  return code2 === CHAR_FORWARD_SLASH || code2 === CHAR_BACKWARD_SLASH;
}
function isWindowsDeviceRoot(code2) {
  return code2 >= CHAR_LOWERCASE_A && code2 <= CHAR_LOWERCASE_Z || code2 >= CHAR_UPPERCASE_A && code2 <= CHAR_UPPERCASE_Z;
}
function extname$1(path) {
  assertPath(path);
  let start = 0;
  let startDot = -1;
  let startPart = 0;
  let end = -1;
  let matchedSlash = true;
  let preDotState = 0;
  if (path.length >= 2 && path.charCodeAt(1) === CHAR_COLON && isWindowsDeviceRoot(path.charCodeAt(0))) {
    start = startPart = 2;
  }
  for (let i2 = path.length - 1; i2 >= start; --i2) {
    const code2 = path.charCodeAt(i2);
    if (isPathSeparator(code2)) {
      if (!matchedSlash) {
        startPart = i2 + 1;
        break;
      }
      continue;
    }
    if (end === -1) {
      matchedSlash = false;
      end = i2 + 1;
    }
    if (code2 === CHAR_DOT) {
      if (startDot === -1) startDot = i2;
      else if (preDotState !== 1) preDotState = 1;
    } else if (startDot !== -1) {
      preDotState = -1;
    }
  }
  if (startDot === -1 || end === -1 || // We saw a non-dot character immediately before the dot
  preDotState === 0 || // The (right-most) trimmed path component is exactly '..'
  preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
    return "";
  }
  return path.slice(startDot, end);
}
function extname(path) {
  return isWindows ? extname$1(path) : extname$2(path);
}
function normalize(path) {
  assertArg(path);
  const len = path.length;
  let rootEnd = 0;
  let device;
  let isAbsolute2 = false;
  const code2 = path.charCodeAt(0);
  if (len > 1) {
    if (isPathSeparator(code2)) {
      isAbsolute2 = true;
      if (isPathSeparator(path.charCodeAt(1))) {
        let j2 = 2;
        let last = j2;
        for (; j2 < len; ++j2) {
          if (isPathSeparator(path.charCodeAt(j2))) break;
        }
        if (j2 < len && j2 !== last) {
          const firstPart = path.slice(last, j2);
          last = j2;
          for (; j2 < len; ++j2) {
            if (!isPathSeparator(path.charCodeAt(j2))) break;
          }
          if (j2 < len && j2 !== last) {
            last = j2;
            for (; j2 < len; ++j2) {
              if (isPathSeparator(path.charCodeAt(j2))) break;
            }
            if (j2 === len) {
              return `\\\\${firstPart}\\${path.slice(last)}\\`;
            } else if (j2 !== last) {
              device = `\\\\${firstPart}\\${path.slice(last, j2)}`;
              rootEnd = j2;
            }
          }
        }
      } else {
        rootEnd = 1;
      }
    } else if (isWindowsDeviceRoot(code2)) {
      if (path.charCodeAt(1) === CHAR_COLON) {
        device = path.slice(0, 2);
        rootEnd = 2;
        if (len > 2) {
          if (isPathSeparator(path.charCodeAt(2))) {
            isAbsolute2 = true;
            rootEnd = 3;
          }
        }
      }
    }
  } else if (isPathSeparator(code2)) {
    return "\\";
  }
  let tail;
  if (rootEnd < len) {
    tail = normalizeString(path.slice(rootEnd), !isAbsolute2, "\\", isPathSeparator);
  } else {
    tail = "";
  }
  if (tail.length === 0 && !isAbsolute2) tail = ".";
  if (tail.length > 0 && isPathSeparator(path.charCodeAt(len - 1))) {
    tail += "\\";
  }
  if (device === void 0) {
    if (isAbsolute2) {
      if (tail.length > 0) return `\\${tail}`;
      else return "\\";
    }
    return tail;
  } else if (isAbsolute2) {
    if (tail.length > 0) return `${device}\\${tail}`;
    else return `${device}\\`;
  }
  return device + tail;
}
function join$1(...paths) {
  paths.forEach((path) => assertPath(path));
  paths = paths.filter((path) => path.length > 0);
  if (paths.length === 0) return ".";
  let needsReplace = true;
  let slashCount = 0;
  const firstPart = paths[0];
  if (isPathSeparator(firstPart.charCodeAt(0))) {
    ++slashCount;
    const firstLen = firstPart.length;
    if (firstLen > 1) {
      if (isPathSeparator(firstPart.charCodeAt(1))) {
        ++slashCount;
        if (firstLen > 2) {
          if (isPathSeparator(firstPart.charCodeAt(2))) ++slashCount;
          else {
            needsReplace = false;
          }
        }
      }
    }
  }
  let joined = paths.join("\\");
  if (needsReplace) {
    for (; slashCount < joined.length; ++slashCount) {
      if (!isPathSeparator(joined.charCodeAt(slashCount))) break;
    }
    if (slashCount >= 2) joined = `\\${joined.slice(slashCount)}`;
  }
  return normalize(joined);
}
function join(...paths) {
  return isWindows ? join$1(...paths) : join$2(...paths);
}
function resolve$2(...pathSegments) {
  let resolvedPath = "";
  let resolvedAbsolute = false;
  for (let i2 = pathSegments.length - 1; i2 >= -1 && !resolvedAbsolute; i2--) {
    let path;
    if (i2 >= 0) path = pathSegments[i2];
    else {
      const {
        Deno: Deno2
      } = globalThis;
      if (typeof Deno2?.cwd !== "function") {
        throw new TypeError("Resolved a relative path without a CWD.");
      }
      path = Deno2.cwd();
    }
    assertPath(path);
    if (path.length === 0) {
      continue;
    }
    resolvedPath = `${path}/${resolvedPath}`;
    resolvedAbsolute = isPosixPathSeparator(path.charCodeAt(0));
  }
  resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute, "/", isPosixPathSeparator);
  if (resolvedAbsolute) {
    if (resolvedPath.length > 0) return `/${resolvedPath}`;
    else return "/";
  } else if (resolvedPath.length > 0) return resolvedPath;
  else return ".";
}
function assertArgs(from, to) {
  assertPath(from);
  assertPath(to);
  if (from === to) return "";
}
function relative$2(from, to) {
  assertArgs(from, to);
  from = resolve$2(from);
  to = resolve$2(to);
  if (from === to) return "";
  let fromStart = 1;
  const fromEnd = from.length;
  for (; fromStart < fromEnd; ++fromStart) {
    if (!isPosixPathSeparator(from.charCodeAt(fromStart))) break;
  }
  const fromLen = fromEnd - fromStart;
  let toStart = 1;
  const toEnd = to.length;
  for (; toStart < toEnd; ++toStart) {
    if (!isPosixPathSeparator(to.charCodeAt(toStart))) break;
  }
  const toLen = toEnd - toStart;
  const length = fromLen < toLen ? fromLen : toLen;
  let lastCommonSep = -1;
  let i2 = 0;
  for (; i2 <= length; ++i2) {
    if (i2 === length) {
      if (toLen > length) {
        if (isPosixPathSeparator(to.charCodeAt(toStart + i2))) {
          return to.slice(toStart + i2 + 1);
        } else if (i2 === 0) {
          return to.slice(toStart + i2);
        }
      } else if (fromLen > length) {
        if (isPosixPathSeparator(from.charCodeAt(fromStart + i2))) {
          lastCommonSep = i2;
        } else if (i2 === 0) {
          lastCommonSep = 0;
        }
      }
      break;
    }
    const fromCode = from.charCodeAt(fromStart + i2);
    const toCode = to.charCodeAt(toStart + i2);
    if (fromCode !== toCode) break;
    else if (isPosixPathSeparator(fromCode)) lastCommonSep = i2;
  }
  let out = "";
  for (i2 = fromStart + lastCommonSep + 1; i2 <= fromEnd; ++i2) {
    if (i2 === fromEnd || isPosixPathSeparator(from.charCodeAt(i2))) {
      if (out.length === 0) out += "..";
      else out += "/..";
    }
  }
  if (out.length > 0) return out + to.slice(toStart + lastCommonSep);
  else {
    toStart += lastCommonSep;
    if (isPosixPathSeparator(to.charCodeAt(toStart))) ++toStart;
    return to.slice(toStart);
  }
}
function resolve$1(...pathSegments) {
  let resolvedDevice = "";
  let resolvedTail = "";
  let resolvedAbsolute = false;
  for (let i2 = pathSegments.length - 1; i2 >= -1; i2--) {
    let path;
    const {
      Deno: Deno2
    } = globalThis;
    if (i2 >= 0) {
      path = pathSegments[i2];
    } else if (!resolvedDevice) {
      if (typeof Deno2?.cwd !== "function") {
        throw new TypeError("Resolved a drive-letter-less path without a CWD.");
      }
      path = Deno2.cwd();
    } else {
      if (typeof Deno2?.env?.get !== "function" || typeof Deno2?.cwd !== "function") {
        throw new TypeError("Resolved a relative path without a CWD.");
      }
      path = Deno2.cwd();
      if (path === void 0 || path.slice(0, 3).toLowerCase() !== `${resolvedDevice.toLowerCase()}\\`) {
        path = `${resolvedDevice}\\`;
      }
    }
    assertPath(path);
    const len = path.length;
    if (len === 0) continue;
    let rootEnd = 0;
    let device = "";
    let isAbsolute2 = false;
    const code2 = path.charCodeAt(0);
    if (len > 1) {
      if (isPathSeparator(code2)) {
        isAbsolute2 = true;
        if (isPathSeparator(path.charCodeAt(1))) {
          let j2 = 2;
          let last = j2;
          for (; j2 < len; ++j2) {
            if (isPathSeparator(path.charCodeAt(j2))) break;
          }
          if (j2 < len && j2 !== last) {
            const firstPart = path.slice(last, j2);
            last = j2;
            for (; j2 < len; ++j2) {
              if (!isPathSeparator(path.charCodeAt(j2))) break;
            }
            if (j2 < len && j2 !== last) {
              last = j2;
              for (; j2 < len; ++j2) {
                if (isPathSeparator(path.charCodeAt(j2))) break;
              }
              if (j2 === len) {
                device = `\\\\${firstPart}\\${path.slice(last)}`;
                rootEnd = j2;
              } else if (j2 !== last) {
                device = `\\\\${firstPart}\\${path.slice(last, j2)}`;
                rootEnd = j2;
              }
            }
          }
        } else {
          rootEnd = 1;
        }
      } else if (isWindowsDeviceRoot(code2)) {
        if (path.charCodeAt(1) === CHAR_COLON) {
          device = path.slice(0, 2);
          rootEnd = 2;
          if (len > 2) {
            if (isPathSeparator(path.charCodeAt(2))) {
              isAbsolute2 = true;
              rootEnd = 3;
            }
          }
        }
      }
    } else if (isPathSeparator(code2)) {
      rootEnd = 1;
      isAbsolute2 = true;
    }
    if (device.length > 0 && resolvedDevice.length > 0 && device.toLowerCase() !== resolvedDevice.toLowerCase()) {
      continue;
    }
    if (resolvedDevice.length === 0 && device.length > 0) {
      resolvedDevice = device;
    }
    if (!resolvedAbsolute) {
      resolvedTail = `${path.slice(rootEnd)}\\${resolvedTail}`;
      resolvedAbsolute = isAbsolute2;
    }
    if (resolvedAbsolute && resolvedDevice.length > 0) break;
  }
  resolvedTail = normalizeString(resolvedTail, !resolvedAbsolute, "\\", isPathSeparator);
  return resolvedDevice + (resolvedAbsolute ? "\\" : "") + resolvedTail || ".";
}
function relative$1(from, to) {
  assertArgs(from, to);
  const fromOrig = resolve$1(from);
  const toOrig = resolve$1(to);
  if (fromOrig === toOrig) return "";
  from = fromOrig.toLowerCase();
  to = toOrig.toLowerCase();
  if (from === to) return "";
  let fromStart = 0;
  let fromEnd = from.length;
  for (; fromStart < fromEnd; ++fromStart) {
    if (from.charCodeAt(fromStart) !== CHAR_BACKWARD_SLASH) break;
  }
  for (; fromEnd - 1 > fromStart; --fromEnd) {
    if (from.charCodeAt(fromEnd - 1) !== CHAR_BACKWARD_SLASH) break;
  }
  const fromLen = fromEnd - fromStart;
  let toStart = 0;
  let toEnd = to.length;
  for (; toStart < toEnd; ++toStart) {
    if (to.charCodeAt(toStart) !== CHAR_BACKWARD_SLASH) break;
  }
  for (; toEnd - 1 > toStart; --toEnd) {
    if (to.charCodeAt(toEnd - 1) !== CHAR_BACKWARD_SLASH) break;
  }
  const toLen = toEnd - toStart;
  const length = fromLen < toLen ? fromLen : toLen;
  let lastCommonSep = -1;
  let i2 = 0;
  for (; i2 <= length; ++i2) {
    if (i2 === length) {
      if (toLen > length) {
        if (to.charCodeAt(toStart + i2) === CHAR_BACKWARD_SLASH) {
          return toOrig.slice(toStart + i2 + 1);
        } else if (i2 === 2) {
          return toOrig.slice(toStart + i2);
        }
      }
      if (fromLen > length) {
        if (from.charCodeAt(fromStart + i2) === CHAR_BACKWARD_SLASH) {
          lastCommonSep = i2;
        } else if (i2 === 2) {
          lastCommonSep = 3;
        }
      }
      break;
    }
    const fromCode = from.charCodeAt(fromStart + i2);
    const toCode = to.charCodeAt(toStart + i2);
    if (fromCode !== toCode) break;
    else if (fromCode === CHAR_BACKWARD_SLASH) lastCommonSep = i2;
  }
  if (i2 !== length && lastCommonSep === -1) {
    return toOrig;
  }
  let out = "";
  if (lastCommonSep === -1) lastCommonSep = 0;
  for (i2 = fromStart + lastCommonSep + 1; i2 <= fromEnd; ++i2) {
    if (i2 === fromEnd || from.charCodeAt(i2) === CHAR_BACKWARD_SLASH) {
      if (out.length === 0) out += "..";
      else out += "\\..";
    }
  }
  if (out.length > 0) {
    return out + toOrig.slice(toStart + lastCommonSep, toEnd);
  } else {
    toStart += lastCommonSep;
    if (toOrig.charCodeAt(toStart) === CHAR_BACKWARD_SLASH) ++toStart;
    return toOrig.slice(toStart, toEnd);
  }
}
function relative(from, to) {
  return isWindows ? relative$1(from, to) : relative$2(from, to);
}
function resolve(...pathSegments) {
  return isWindows ? resolve$1(...pathSegments) : resolve$2(...pathSegments);
}
const SEPARATOR_PATTERN = isWindows ? /[\\/]+/ : /\/+/;
function consumeToken(v2) {
  const notPos = indexOf(v2, isNotTokenChar);
  if (notPos === -1) {
    return [v2, ""];
  }
  if (notPos === 0) {
    return ["", v2];
  }
  return [v2.slice(0, notPos), v2.slice(notPos)];
}
function consumeValue(v2) {
  if (!v2) {
    return ["", v2];
  }
  if (v2[0] !== `"`) {
    return consumeToken(v2);
  }
  let value = "";
  for (let i2 = 1; i2 < v2.length; i2++) {
    const r2 = v2[i2];
    if (r2 === `"`) {
      return [value, v2.slice(i2 + 1)];
    }
    const next = v2[i2 + 1];
    if (r2 === "\\" && typeof next === "string" && isTSpecial(next)) {
      value += next;
      i2++;
      continue;
    }
    if (r2 === "\r" || r2 === "\n") {
      return ["", v2];
    }
    value += v2[i2];
  }
  return ["", v2];
}
function consumeMediaParam(v2) {
  let rest = v2.trimStart();
  if (!rest.startsWith(";")) {
    return ["", "", v2];
  }
  rest = rest.slice(1);
  rest = rest.trimStart();
  let param;
  [param, rest] = consumeToken(rest);
  param = param.toLowerCase();
  if (!param) {
    return ["", "", v2];
  }
  rest = rest.slice(1);
  rest = rest.trimStart();
  const [value, rest2] = consumeValue(rest);
  if (value === "" && rest2 === rest) {
    return ["", "", v2];
  }
  rest = rest2;
  return [param, value, rest];
}
function decode2331Encoding(v2) {
  const sv = v2.split(`'`, 3);
  if (sv.length !== 3) {
    return void 0;
  }
  const [sv0, , sv2] = sv;
  const charset = sv0.toLowerCase();
  if (!charset) {
    return void 0;
  }
  if (charset !== "us-ascii" && charset !== "utf-8") {
    return void 0;
  }
  const encv = decodeURI(sv2);
  if (!encv) {
    return void 0;
  }
  return encv;
}
function indexOf(s2, fn) {
  let i2 = -1;
  for (const v2 of s2) {
    i2++;
    if (fn(v2)) {
      return i2;
    }
  }
  return -1;
}
function isIterator(obj) {
  if (obj === null || obj === void 0) {
    return false;
  }
  return typeof obj[Symbol.iterator] === "function";
}
function isToken(s2) {
  if (!s2) {
    return false;
  }
  return indexOf(s2, isNotTokenChar) < 0;
}
function isNotTokenChar(r2) {
  return !isTokenChar(r2);
}
function isTokenChar(r2) {
  const code2 = r2.charCodeAt(0);
  return code2 > 32 && code2 < 127 && !isTSpecial(r2);
}
function isTSpecial(r2) {
  return r2[0] ? `()<>@,;:\\"/[]?=`.includes(r2[0]) : false;
}
const CHAR_CODE_SPACE = " ".charCodeAt(0);
const CHAR_CODE_TILDE = "~".charCodeAt(0);
function needsEncoding(s2) {
  for (const b2 of s2) {
    const charCode = b2.charCodeAt(0);
    if ((charCode < CHAR_CODE_SPACE || charCode > CHAR_CODE_TILDE) && b2 !== "	") {
      return true;
    }
  }
  return false;
}
const SEMICOLON_REGEXP = /^\s*;\s*$/;
function parseMediaType(type) {
  const [base] = type.split(";");
  const mediaType = base.toLowerCase().trim();
  const params = {};
  const continuation = /* @__PURE__ */ new Map();
  type = type.slice(base.length);
  while (type.length) {
    type = type.trimStart();
    if (type.length === 0) {
      break;
    }
    const [key, value, rest] = consumeMediaParam(type);
    if (!key) {
      if (SEMICOLON_REGEXP.test(rest)) {
        break;
      }
      throw new TypeError(`Cannot parse media type: invalid parameter "${type}"`);
    }
    let pmap = params;
    const [baseName, rest2] = key.split("*");
    if (baseName && rest2 !== void 0) {
      if (!continuation.has(baseName)) {
        continuation.set(baseName, {});
      }
      pmap = continuation.get(baseName);
    }
    if (key in pmap) {
      throw new TypeError("Cannot parse media type: duplicate key");
    }
    pmap[key] = value;
    type = rest;
  }
  let str = "";
  for (const [key, pieceMap] of continuation) {
    const singlePartKey = `${key}*`;
    const type2 = pieceMap[singlePartKey];
    if (type2) {
      const decv = decode2331Encoding(type2);
      if (decv) {
        params[key] = decv;
      }
      continue;
    }
    str = "";
    let valid = false;
    for (let n2 = 0; ; n2++) {
      const simplePart = `${key}*${n2}`;
      let type3 = pieceMap[simplePart];
      if (type3) {
        valid = true;
        str += type3;
        continue;
      }
      const encodedPart = `${simplePart}*`;
      type3 = pieceMap[encodedPart];
      if (!type3) {
        break;
      }
      valid = true;
      if (n2 === 0) {
        const decv = decode2331Encoding(type3);
        if (decv) {
          str += decv;
        }
      } else {
        const decv = decodeURI(type3);
        str += decv;
      }
    }
    if (valid) {
      params[key] = str;
    }
  }
  return [mediaType, Object.keys(params).length ? params : void 0];
}
const db = {
  "application/1d-interleaved-parityfec": {
    "source": "iana"
  },
  "application/3gpdash-qoe-report+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/3gpp-ims+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/3gpphal+json": {
    "source": "iana",
    "compressible": true
  },
  "application/3gpphalforms+json": {
    "source": "iana",
    "compressible": true
  },
  "application/a2l": {
    "source": "iana"
  },
  "application/ace+cbor": {
    "source": "iana"
  },
  "application/ace+json": {
    "source": "iana",
    "compressible": true
  },
  "application/ace-groupcomm+cbor": {
    "source": "iana"
  },
  "application/activemessage": {
    "source": "iana"
  },
  "application/activity+json": {
    "source": "iana",
    "compressible": true
  },
  "application/aif+cbor": {
    "source": "iana"
  },
  "application/aif+json": {
    "source": "iana",
    "compressible": true
  },
  "application/alto-cdni+json": {
    "source": "iana",
    "compressible": true
  },
  "application/alto-cdnifilter+json": {
    "source": "iana",
    "compressible": true
  },
  "application/alto-costmap+json": {
    "source": "iana",
    "compressible": true
  },
  "application/alto-costmapfilter+json": {
    "source": "iana",
    "compressible": true
  },
  "application/alto-directory+json": {
    "source": "iana",
    "compressible": true
  },
  "application/alto-endpointcost+json": {
    "source": "iana",
    "compressible": true
  },
  "application/alto-endpointcostparams+json": {
    "source": "iana",
    "compressible": true
  },
  "application/alto-endpointprop+json": {
    "source": "iana",
    "compressible": true
  },
  "application/alto-endpointpropparams+json": {
    "source": "iana",
    "compressible": true
  },
  "application/alto-error+json": {
    "source": "iana",
    "compressible": true
  },
  "application/alto-networkmap+json": {
    "source": "iana",
    "compressible": true
  },
  "application/alto-networkmapfilter+json": {
    "source": "iana",
    "compressible": true
  },
  "application/alto-propmap+json": {
    "source": "iana",
    "compressible": true
  },
  "application/alto-propmapparams+json": {
    "source": "iana",
    "compressible": true
  },
  "application/alto-tips+json": {
    "source": "iana",
    "compressible": true
  },
  "application/alto-tipsparams+json": {
    "source": "iana",
    "compressible": true
  },
  "application/alto-updatestreamcontrol+json": {
    "source": "iana",
    "compressible": true
  },
  "application/alto-updatestreamparams+json": {
    "source": "iana",
    "compressible": true
  },
  "application/aml": {
    "source": "iana"
  },
  "application/andrew-inset": {
    "source": "iana",
    "extensions": ["ez"]
  },
  "application/appinstaller": {
    "compressible": false,
    "extensions": ["appinstaller"]
  },
  "application/applefile": {
    "source": "iana"
  },
  "application/applixware": {
    "source": "apache",
    "extensions": ["aw"]
  },
  "application/appx": {
    "compressible": false,
    "extensions": ["appx"]
  },
  "application/appxbundle": {
    "compressible": false,
    "extensions": ["appxbundle"]
  },
  "application/at+jwt": {
    "source": "iana"
  },
  "application/atf": {
    "source": "iana"
  },
  "application/atfx": {
    "source": "iana"
  },
  "application/atom+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["atom"]
  },
  "application/atomcat+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["atomcat"]
  },
  "application/atomdeleted+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["atomdeleted"]
  },
  "application/atomicmail": {
    "source": "iana"
  },
  "application/atomsvc+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["atomsvc"]
  },
  "application/atsc-dwd+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["dwd"]
  },
  "application/atsc-dynamic-event-message": {
    "source": "iana"
  },
  "application/atsc-held+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["held"]
  },
  "application/atsc-rdt+json": {
    "source": "iana",
    "compressible": true
  },
  "application/atsc-rsat+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["rsat"]
  },
  "application/atxml": {
    "source": "iana"
  },
  "application/auth-policy+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/automationml-aml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["aml"]
  },
  "application/automationml-amlx+zip": {
    "source": "iana",
    "compressible": false,
    "extensions": ["amlx"]
  },
  "application/bacnet-xdd+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/batch-smtp": {
    "source": "iana"
  },
  "application/bdoc": {
    "compressible": false,
    "extensions": ["bdoc"]
  },
  "application/beep+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/bufr": {
    "source": "iana"
  },
  "application/c2pa": {
    "source": "iana"
  },
  "application/calendar+json": {
    "source": "iana",
    "compressible": true
  },
  "application/calendar+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["xcs"]
  },
  "application/call-completion": {
    "source": "iana"
  },
  "application/cals-1840": {
    "source": "iana"
  },
  "application/captive+json": {
    "source": "iana",
    "compressible": true
  },
  "application/cbor": {
    "source": "iana"
  },
  "application/cbor-seq": {
    "source": "iana"
  },
  "application/cccex": {
    "source": "iana"
  },
  "application/ccmp+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/ccxml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["ccxml"]
  },
  "application/cda+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/cdfx+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["cdfx"]
  },
  "application/cdmi-capability": {
    "source": "iana",
    "extensions": ["cdmia"]
  },
  "application/cdmi-container": {
    "source": "iana",
    "extensions": ["cdmic"]
  },
  "application/cdmi-domain": {
    "source": "iana",
    "extensions": ["cdmid"]
  },
  "application/cdmi-object": {
    "source": "iana",
    "extensions": ["cdmio"]
  },
  "application/cdmi-queue": {
    "source": "iana",
    "extensions": ["cdmiq"]
  },
  "application/cdni": {
    "source": "iana"
  },
  "application/cea": {
    "source": "iana"
  },
  "application/cea-2018+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/cellml+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/cfw": {
    "source": "iana"
  },
  "application/cid-edhoc+cbor-seq": {
    "source": "iana"
  },
  "application/city+json": {
    "source": "iana",
    "compressible": true
  },
  "application/clr": {
    "source": "iana"
  },
  "application/clue+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/clue_info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/cms": {
    "source": "iana"
  },
  "application/cnrp+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/coap-group+json": {
    "source": "iana",
    "compressible": true
  },
  "application/coap-payload": {
    "source": "iana"
  },
  "application/commonground": {
    "source": "iana"
  },
  "application/concise-problem-details+cbor": {
    "source": "iana"
  },
  "application/conference-info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/cose": {
    "source": "iana"
  },
  "application/cose-key": {
    "source": "iana"
  },
  "application/cose-key-set": {
    "source": "iana"
  },
  "application/cose-x509": {
    "source": "iana"
  },
  "application/cpl+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["cpl"]
  },
  "application/csrattrs": {
    "source": "iana"
  },
  "application/csta+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/cstadata+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/csvm+json": {
    "source": "iana",
    "compressible": true
  },
  "application/cu-seeme": {
    "source": "apache",
    "extensions": ["cu"]
  },
  "application/cwl": {
    "source": "iana",
    "extensions": ["cwl"]
  },
  "application/cwl+json": {
    "source": "iana",
    "compressible": true
  },
  "application/cwl+yaml": {
    "source": "iana"
  },
  "application/cwt": {
    "source": "iana"
  },
  "application/cybercash": {
    "source": "iana"
  },
  "application/dart": {
    "compressible": true
  },
  "application/dash+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["mpd"]
  },
  "application/dash-patch+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["mpp"]
  },
  "application/dashdelta": {
    "source": "iana"
  },
  "application/davmount+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["davmount"]
  },
  "application/dca-rft": {
    "source": "iana"
  },
  "application/dcd": {
    "source": "iana"
  },
  "application/dec-dx": {
    "source": "iana"
  },
  "application/dialog-info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/dicom": {
    "source": "iana"
  },
  "application/dicom+json": {
    "source": "iana",
    "compressible": true
  },
  "application/dicom+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/dii": {
    "source": "iana"
  },
  "application/dit": {
    "source": "iana"
  },
  "application/dns": {
    "source": "iana"
  },
  "application/dns+json": {
    "source": "iana",
    "compressible": true
  },
  "application/dns-message": {
    "source": "iana"
  },
  "application/docbook+xml": {
    "source": "apache",
    "compressible": true,
    "extensions": ["dbk"]
  },
  "application/dots+cbor": {
    "source": "iana"
  },
  "application/dpop+jwt": {
    "source": "iana"
  },
  "application/dskpp+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/dssc+der": {
    "source": "iana",
    "extensions": ["dssc"]
  },
  "application/dssc+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["xdssc"]
  },
  "application/dvcs": {
    "source": "iana"
  },
  "application/ecmascript": {
    "source": "apache",
    "compressible": true,
    "extensions": ["ecma"]
  },
  "application/edhoc+cbor-seq": {
    "source": "iana"
  },
  "application/edi-consent": {
    "source": "iana"
  },
  "application/edi-x12": {
    "source": "iana",
    "compressible": false
  },
  "application/edifact": {
    "source": "iana",
    "compressible": false
  },
  "application/efi": {
    "source": "iana"
  },
  "application/elm+json": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/elm+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/emergencycalldata.cap+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/emergencycalldata.comment+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/emergencycalldata.control+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/emergencycalldata.deviceinfo+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/emergencycalldata.ecall.msd": {
    "source": "iana"
  },
  "application/emergencycalldata.legacyesn+json": {
    "source": "iana",
    "compressible": true
  },
  "application/emergencycalldata.providerinfo+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/emergencycalldata.serviceinfo+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/emergencycalldata.subscriberinfo+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/emergencycalldata.veds+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/emma+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["emma"]
  },
  "application/emotionml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["emotionml"]
  },
  "application/encaprtp": {
    "source": "iana"
  },
  "application/epp+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/epub+zip": {
    "source": "iana",
    "compressible": false,
    "extensions": ["epub"]
  },
  "application/eshop": {
    "source": "iana"
  },
  "application/exi": {
    "source": "iana",
    "extensions": ["exi"]
  },
  "application/expect-ct-report+json": {
    "source": "iana",
    "compressible": true
  },
  "application/express": {
    "source": "iana",
    "extensions": ["exp"]
  },
  "application/fastinfoset": {
    "source": "iana"
  },
  "application/fastsoap": {
    "source": "iana"
  },
  "application/fdf": {
    "source": "iana",
    "extensions": ["fdf"]
  },
  "application/fdt+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["fdt"]
  },
  "application/fhir+json": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/fhir+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/fido.trusted-apps+json": {
    "compressible": true
  },
  "application/fits": {
    "source": "iana"
  },
  "application/flexfec": {
    "source": "iana"
  },
  "application/font-sfnt": {
    "source": "iana"
  },
  "application/font-tdpfr": {
    "source": "iana",
    "extensions": ["pfr"]
  },
  "application/font-woff": {
    "source": "iana",
    "compressible": false
  },
  "application/framework-attributes+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/geo+json": {
    "source": "iana",
    "compressible": true,
    "extensions": ["geojson"]
  },
  "application/geo+json-seq": {
    "source": "iana"
  },
  "application/geopackage+sqlite3": {
    "source": "iana"
  },
  "application/geoxacml+json": {
    "source": "iana",
    "compressible": true
  },
  "application/geoxacml+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/gltf-buffer": {
    "source": "iana"
  },
  "application/gml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["gml"]
  },
  "application/gnap-binding-jws": {
    "source": "iana"
  },
  "application/gnap-binding-jwsd": {
    "source": "iana"
  },
  "application/gnap-binding-rotation-jws": {
    "source": "iana"
  },
  "application/gnap-binding-rotation-jwsd": {
    "source": "iana"
  },
  "application/gpx+xml": {
    "source": "apache",
    "compressible": true,
    "extensions": ["gpx"]
  },
  "application/grib": {
    "source": "iana"
  },
  "application/gxf": {
    "source": "apache",
    "extensions": ["gxf"]
  },
  "application/gzip": {
    "source": "iana",
    "compressible": false,
    "extensions": ["gz"]
  },
  "application/h224": {
    "source": "iana"
  },
  "application/held+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/hjson": {
    "extensions": ["hjson"]
  },
  "application/hl7v2+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/http": {
    "source": "iana"
  },
  "application/hyperstudio": {
    "source": "iana",
    "extensions": ["stk"]
  },
  "application/ibe-key-request+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/ibe-pkg-reply+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/ibe-pp-data": {
    "source": "iana"
  },
  "application/iges": {
    "source": "iana"
  },
  "application/im-iscomposing+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/index": {
    "source": "iana"
  },
  "application/index.cmd": {
    "source": "iana"
  },
  "application/index.obj": {
    "source": "iana"
  },
  "application/index.response": {
    "source": "iana"
  },
  "application/index.vnd": {
    "source": "iana"
  },
  "application/inkml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["ink", "inkml"]
  },
  "application/iotp": {
    "source": "iana"
  },
  "application/ipfix": {
    "source": "iana",
    "extensions": ["ipfix"]
  },
  "application/ipp": {
    "source": "iana"
  },
  "application/isup": {
    "source": "iana"
  },
  "application/its+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["its"]
  },
  "application/java-archive": {
    "source": "iana",
    "compressible": false,
    "extensions": ["jar", "war", "ear"]
  },
  "application/java-serialized-object": {
    "source": "apache",
    "compressible": false,
    "extensions": ["ser"]
  },
  "application/java-vm": {
    "source": "apache",
    "compressible": false,
    "extensions": ["class"]
  },
  "application/javascript": {
    "source": "apache",
    "charset": "UTF-8",
    "compressible": true,
    "extensions": ["js"]
  },
  "application/jf2feed+json": {
    "source": "iana",
    "compressible": true
  },
  "application/jose": {
    "source": "iana"
  },
  "application/jose+json": {
    "source": "iana",
    "compressible": true
  },
  "application/jrd+json": {
    "source": "iana",
    "compressible": true
  },
  "application/jscalendar+json": {
    "source": "iana",
    "compressible": true
  },
  "application/jscontact+json": {
    "source": "iana",
    "compressible": true
  },
  "application/json": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true,
    "extensions": ["json", "map"]
  },
  "application/json-patch+json": {
    "source": "iana",
    "compressible": true
  },
  "application/json-seq": {
    "source": "iana"
  },
  "application/json5": {
    "extensions": ["json5"]
  },
  "application/jsonml+json": {
    "source": "apache",
    "compressible": true,
    "extensions": ["jsonml"]
  },
  "application/jsonpath": {
    "source": "iana"
  },
  "application/jwk+json": {
    "source": "iana",
    "compressible": true
  },
  "application/jwk-set+json": {
    "source": "iana",
    "compressible": true
  },
  "application/jwt": {
    "source": "iana"
  },
  "application/kpml-request+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/kpml-response+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/ld+json": {
    "source": "iana",
    "compressible": true,
    "extensions": ["jsonld"]
  },
  "application/lgr+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["lgr"]
  },
  "application/link-format": {
    "source": "iana"
  },
  "application/linkset": {
    "source": "iana"
  },
  "application/linkset+json": {
    "source": "iana",
    "compressible": true
  },
  "application/load-control+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/logout+jwt": {
    "source": "iana"
  },
  "application/lost+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["lostxml"]
  },
  "application/lostsync+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/lpf+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/lxf": {
    "source": "iana"
  },
  "application/mac-binhex40": {
    "source": "iana",
    "extensions": ["hqx"]
  },
  "application/mac-compactpro": {
    "source": "apache",
    "extensions": ["cpt"]
  },
  "application/macwriteii": {
    "source": "iana"
  },
  "application/mads+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["mads"]
  },
  "application/manifest+json": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true,
    "extensions": ["webmanifest"]
  },
  "application/marc": {
    "source": "iana",
    "extensions": ["mrc"]
  },
  "application/marcxml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["mrcx"]
  },
  "application/mathematica": {
    "source": "iana",
    "extensions": ["ma", "nb", "mb"]
  },
  "application/mathml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["mathml"]
  },
  "application/mathml-content+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/mathml-presentation+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/mbms-associated-procedure-description+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/mbms-deregister+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/mbms-envelope+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/mbms-msk+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/mbms-msk-response+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/mbms-protection-description+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/mbms-reception-report+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/mbms-register+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/mbms-register-response+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/mbms-schedule+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/mbms-user-service-description+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/mbox": {
    "source": "iana",
    "extensions": ["mbox"]
  },
  "application/media-policy-dataset+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["mpf"]
  },
  "application/media_control+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/mediaservercontrol+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["mscml"]
  },
  "application/merge-patch+json": {
    "source": "iana",
    "compressible": true
  },
  "application/metalink+xml": {
    "source": "apache",
    "compressible": true,
    "extensions": ["metalink"]
  },
  "application/metalink4+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["meta4"]
  },
  "application/mets+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["mets"]
  },
  "application/mf4": {
    "source": "iana"
  },
  "application/mikey": {
    "source": "iana"
  },
  "application/mipc": {
    "source": "iana"
  },
  "application/missing-blocks+cbor-seq": {
    "source": "iana"
  },
  "application/mmt-aei+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["maei"]
  },
  "application/mmt-usd+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["musd"]
  },
  "application/mods+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["mods"]
  },
  "application/moss-keys": {
    "source": "iana"
  },
  "application/moss-signature": {
    "source": "iana"
  },
  "application/mosskey-data": {
    "source": "iana"
  },
  "application/mosskey-request": {
    "source": "iana"
  },
  "application/mp21": {
    "source": "iana",
    "extensions": ["m21", "mp21"]
  },
  "application/mp4": {
    "source": "iana",
    "extensions": ["mp4", "mpg4", "mp4s", "m4p"]
  },
  "application/mpeg4-generic": {
    "source": "iana"
  },
  "application/mpeg4-iod": {
    "source": "iana"
  },
  "application/mpeg4-iod-xmt": {
    "source": "iana"
  },
  "application/mrb-consumer+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/mrb-publish+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/msc-ivr+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/msc-mixer+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/msix": {
    "compressible": false,
    "extensions": ["msix"]
  },
  "application/msixbundle": {
    "compressible": false,
    "extensions": ["msixbundle"]
  },
  "application/msword": {
    "source": "iana",
    "compressible": false,
    "extensions": ["doc", "dot"]
  },
  "application/mud+json": {
    "source": "iana",
    "compressible": true
  },
  "application/multipart-core": {
    "source": "iana"
  },
  "application/mxf": {
    "source": "iana",
    "extensions": ["mxf"]
  },
  "application/n-quads": {
    "source": "iana",
    "extensions": ["nq"]
  },
  "application/n-triples": {
    "source": "iana",
    "extensions": ["nt"]
  },
  "application/nasdata": {
    "source": "iana"
  },
  "application/news-checkgroups": {
    "source": "iana",
    "charset": "US-ASCII"
  },
  "application/news-groupinfo": {
    "source": "iana",
    "charset": "US-ASCII"
  },
  "application/news-transmission": {
    "source": "iana"
  },
  "application/nlsml+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/node": {
    "source": "iana",
    "extensions": ["cjs"]
  },
  "application/nss": {
    "source": "iana"
  },
  "application/oauth-authz-req+jwt": {
    "source": "iana"
  },
  "application/oblivious-dns-message": {
    "source": "iana"
  },
  "application/ocsp-request": {
    "source": "iana"
  },
  "application/ocsp-response": {
    "source": "iana"
  },
  "application/octet-stream": {
    "source": "iana",
    "compressible": false,
    "extensions": ["bin", "dms", "lrf", "mar", "so", "dist", "distz", "pkg", "bpk", "dump", "elc", "deploy", "exe", "dll", "deb", "dmg", "iso", "img", "msi", "msp", "msm", "buffer"]
  },
  "application/oda": {
    "source": "iana",
    "extensions": ["oda"]
  },
  "application/odm+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/odx": {
    "source": "iana"
  },
  "application/oebps-package+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["opf"]
  },
  "application/ogg": {
    "source": "iana",
    "compressible": false,
    "extensions": ["ogx"]
  },
  "application/ohttp-keys": {
    "source": "iana"
  },
  "application/omdoc+xml": {
    "source": "apache",
    "compressible": true,
    "extensions": ["omdoc"]
  },
  "application/onenote": {
    "source": "apache",
    "extensions": ["onetoc", "onetoc2", "onetmp", "onepkg"]
  },
  "application/opc-nodeset+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/oscore": {
    "source": "iana"
  },
  "application/oxps": {
    "source": "iana",
    "extensions": ["oxps"]
  },
  "application/p21": {
    "source": "iana"
  },
  "application/p21+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/p2p-overlay+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["relo"]
  },
  "application/parityfec": {
    "source": "iana"
  },
  "application/passport": {
    "source": "iana"
  },
  "application/patch-ops-error+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["xer"]
  },
  "application/pdf": {
    "source": "iana",
    "compressible": false,
    "extensions": ["pdf"]
  },
  "application/pdx": {
    "source": "iana"
  },
  "application/pem-certificate-chain": {
    "source": "iana"
  },
  "application/pgp-encrypted": {
    "source": "iana",
    "compressible": false,
    "extensions": ["pgp"]
  },
  "application/pgp-keys": {
    "source": "iana",
    "extensions": ["asc"]
  },
  "application/pgp-signature": {
    "source": "iana",
    "extensions": ["sig", "asc"]
  },
  "application/pics-rules": {
    "source": "apache",
    "extensions": ["prf"]
  },
  "application/pidf+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/pidf-diff+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/pkcs10": {
    "source": "iana",
    "extensions": ["p10"]
  },
  "application/pkcs12": {
    "source": "iana"
  },
  "application/pkcs7-mime": {
    "source": "iana",
    "extensions": ["p7m", "p7c"]
  },
  "application/pkcs7-signature": {
    "source": "iana",
    "extensions": ["p7s"]
  },
  "application/pkcs8": {
    "source": "iana",
    "extensions": ["p8"]
  },
  "application/pkcs8-encrypted": {
    "source": "iana"
  },
  "application/pkix-attr-cert": {
    "source": "iana",
    "extensions": ["ac"]
  },
  "application/pkix-cert": {
    "source": "iana",
    "extensions": ["cer"]
  },
  "application/pkix-crl": {
    "source": "iana",
    "extensions": ["crl"]
  },
  "application/pkix-pkipath": {
    "source": "iana",
    "extensions": ["pkipath"]
  },
  "application/pkixcmp": {
    "source": "iana",
    "extensions": ["pki"]
  },
  "application/pls+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["pls"]
  },
  "application/poc-settings+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/postscript": {
    "source": "iana",
    "compressible": true,
    "extensions": ["ai", "eps", "ps"]
  },
  "application/ppsp-tracker+json": {
    "source": "iana",
    "compressible": true
  },
  "application/private-token-issuer-directory": {
    "source": "iana"
  },
  "application/private-token-request": {
    "source": "iana"
  },
  "application/private-token-response": {
    "source": "iana"
  },
  "application/problem+json": {
    "source": "iana",
    "compressible": true
  },
  "application/problem+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/provenance+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["provx"]
  },
  "application/prs.alvestrand.titrax-sheet": {
    "source": "iana"
  },
  "application/prs.cww": {
    "source": "iana",
    "extensions": ["cww"]
  },
  "application/prs.cyn": {
    "source": "iana",
    "charset": "7-BIT"
  },
  "application/prs.hpub+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/prs.implied-document+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/prs.implied-executable": {
    "source": "iana"
  },
  "application/prs.implied-object+json": {
    "source": "iana",
    "compressible": true
  },
  "application/prs.implied-object+json-seq": {
    "source": "iana"
  },
  "application/prs.implied-object+yaml": {
    "source": "iana"
  },
  "application/prs.implied-structure": {
    "source": "iana"
  },
  "application/prs.nprend": {
    "source": "iana"
  },
  "application/prs.plucker": {
    "source": "iana"
  },
  "application/prs.rdf-xml-crypt": {
    "source": "iana"
  },
  "application/prs.vcfbzip2": {
    "source": "iana"
  },
  "application/prs.xsf+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["xsf"]
  },
  "application/pskc+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["pskcxml"]
  },
  "application/pvd+json": {
    "source": "iana",
    "compressible": true
  },
  "application/qsig": {
    "source": "iana"
  },
  "application/raml+yaml": {
    "compressible": true,
    "extensions": ["raml"]
  },
  "application/raptorfec": {
    "source": "iana"
  },
  "application/rdap+json": {
    "source": "iana",
    "compressible": true
  },
  "application/rdf+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["rdf", "owl"]
  },
  "application/reginfo+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["rif"]
  },
  "application/relax-ng-compact-syntax": {
    "source": "iana",
    "extensions": ["rnc"]
  },
  "application/remote-printing": {
    "source": "apache"
  },
  "application/reputon+json": {
    "source": "iana",
    "compressible": true
  },
  "application/resource-lists+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["rl"]
  },
  "application/resource-lists-diff+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["rld"]
  },
  "application/rfc+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/riscos": {
    "source": "iana"
  },
  "application/rlmi+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/rls-services+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["rs"]
  },
  "application/route-apd+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["rapd"]
  },
  "application/route-s-tsid+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["sls"]
  },
  "application/route-usd+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["rusd"]
  },
  "application/rpki-checklist": {
    "source": "iana"
  },
  "application/rpki-ghostbusters": {
    "source": "iana",
    "extensions": ["gbr"]
  },
  "application/rpki-manifest": {
    "source": "iana",
    "extensions": ["mft"]
  },
  "application/rpki-publication": {
    "source": "iana"
  },
  "application/rpki-roa": {
    "source": "iana",
    "extensions": ["roa"]
  },
  "application/rpki-signed-tal": {
    "source": "iana"
  },
  "application/rpki-updown": {
    "source": "iana"
  },
  "application/rsd+xml": {
    "source": "apache",
    "compressible": true,
    "extensions": ["rsd"]
  },
  "application/rss+xml": {
    "source": "apache",
    "compressible": true,
    "extensions": ["rss"]
  },
  "application/rtf": {
    "source": "iana",
    "compressible": true,
    "extensions": ["rtf"]
  },
  "application/rtploopback": {
    "source": "iana"
  },
  "application/rtx": {
    "source": "iana"
  },
  "application/samlassertion+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/samlmetadata+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/sarif+json": {
    "source": "iana",
    "compressible": true
  },
  "application/sarif-external-properties+json": {
    "source": "iana",
    "compressible": true
  },
  "application/sbe": {
    "source": "iana"
  },
  "application/sbml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["sbml"]
  },
  "application/scaip+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/scim+json": {
    "source": "iana",
    "compressible": true
  },
  "application/scvp-cv-request": {
    "source": "iana",
    "extensions": ["scq"]
  },
  "application/scvp-cv-response": {
    "source": "iana",
    "extensions": ["scs"]
  },
  "application/scvp-vp-request": {
    "source": "iana",
    "extensions": ["spq"]
  },
  "application/scvp-vp-response": {
    "source": "iana",
    "extensions": ["spp"]
  },
  "application/sdp": {
    "source": "iana",
    "extensions": ["sdp"]
  },
  "application/secevent+jwt": {
    "source": "iana"
  },
  "application/senml+cbor": {
    "source": "iana"
  },
  "application/senml+json": {
    "source": "iana",
    "compressible": true
  },
  "application/senml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["senmlx"]
  },
  "application/senml-etch+cbor": {
    "source": "iana"
  },
  "application/senml-etch+json": {
    "source": "iana",
    "compressible": true
  },
  "application/senml-exi": {
    "source": "iana"
  },
  "application/sensml+cbor": {
    "source": "iana"
  },
  "application/sensml+json": {
    "source": "iana",
    "compressible": true
  },
  "application/sensml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["sensmlx"]
  },
  "application/sensml-exi": {
    "source": "iana"
  },
  "application/sep+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/sep-exi": {
    "source": "iana"
  },
  "application/session-info": {
    "source": "iana"
  },
  "application/set-payment": {
    "source": "iana"
  },
  "application/set-payment-initiation": {
    "source": "iana",
    "extensions": ["setpay"]
  },
  "application/set-registration": {
    "source": "iana"
  },
  "application/set-registration-initiation": {
    "source": "iana",
    "extensions": ["setreg"]
  },
  "application/sgml": {
    "source": "iana"
  },
  "application/sgml-open-catalog": {
    "source": "iana"
  },
  "application/shf+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["shf"]
  },
  "application/sieve": {
    "source": "iana",
    "extensions": ["siv", "sieve"]
  },
  "application/simple-filter+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/simple-message-summary": {
    "source": "iana"
  },
  "application/simplesymbolcontainer": {
    "source": "iana"
  },
  "application/sipc": {
    "source": "iana"
  },
  "application/slate": {
    "source": "iana"
  },
  "application/smil": {
    "source": "apache"
  },
  "application/smil+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["smi", "smil"]
  },
  "application/smpte336m": {
    "source": "iana"
  },
  "application/soap+fastinfoset": {
    "source": "iana"
  },
  "application/soap+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/sparql-query": {
    "source": "iana",
    "extensions": ["rq"]
  },
  "application/sparql-results+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["srx"]
  },
  "application/spdx+json": {
    "source": "iana",
    "compressible": true
  },
  "application/spirits-event+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/sql": {
    "source": "iana",
    "extensions": ["sql"]
  },
  "application/srgs": {
    "source": "iana",
    "extensions": ["gram"]
  },
  "application/srgs+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["grxml"]
  },
  "application/sru+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["sru"]
  },
  "application/ssdl+xml": {
    "source": "apache",
    "compressible": true,
    "extensions": ["ssdl"]
  },
  "application/ssml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["ssml"]
  },
  "application/st2110-41": {
    "source": "iana"
  },
  "application/stix+json": {
    "source": "iana",
    "compressible": true
  },
  "application/stratum": {
    "source": "iana"
  },
  "application/swid+cbor": {
    "source": "iana"
  },
  "application/swid+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["swidtag"]
  },
  "application/tamp-apex-update": {
    "source": "iana"
  },
  "application/tamp-apex-update-confirm": {
    "source": "iana"
  },
  "application/tamp-community-update": {
    "source": "iana"
  },
  "application/tamp-community-update-confirm": {
    "source": "iana"
  },
  "application/tamp-error": {
    "source": "iana"
  },
  "application/tamp-sequence-adjust": {
    "source": "iana"
  },
  "application/tamp-sequence-adjust-confirm": {
    "source": "iana"
  },
  "application/tamp-status-query": {
    "source": "iana"
  },
  "application/tamp-status-response": {
    "source": "iana"
  },
  "application/tamp-update": {
    "source": "iana"
  },
  "application/tamp-update-confirm": {
    "source": "iana"
  },
  "application/tar": {
    "compressible": true
  },
  "application/taxii+json": {
    "source": "iana",
    "compressible": true
  },
  "application/td+json": {
    "source": "iana",
    "compressible": true
  },
  "application/tei+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["tei", "teicorpus"]
  },
  "application/tetra_isi": {
    "source": "iana"
  },
  "application/thraud+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["tfi"]
  },
  "application/timestamp-query": {
    "source": "iana"
  },
  "application/timestamp-reply": {
    "source": "iana"
  },
  "application/timestamped-data": {
    "source": "iana",
    "extensions": ["tsd"]
  },
  "application/tlsrpt+gzip": {
    "source": "iana"
  },
  "application/tlsrpt+json": {
    "source": "iana",
    "compressible": true
  },
  "application/tm+json": {
    "source": "iana",
    "compressible": true
  },
  "application/tnauthlist": {
    "source": "iana"
  },
  "application/token-introspection+jwt": {
    "source": "iana"
  },
  "application/toml": {
    "compressible": true,
    "extensions": ["toml"]
  },
  "application/trickle-ice-sdpfrag": {
    "source": "iana"
  },
  "application/trig": {
    "source": "iana",
    "extensions": ["trig"]
  },
  "application/ttml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["ttml"]
  },
  "application/tve-trigger": {
    "source": "iana"
  },
  "application/tzif": {
    "source": "iana"
  },
  "application/tzif-leap": {
    "source": "iana"
  },
  "application/ubjson": {
    "compressible": false,
    "extensions": ["ubj"]
  },
  "application/ulpfec": {
    "source": "iana"
  },
  "application/urc-grpsheet+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/urc-ressheet+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["rsheet"]
  },
  "application/urc-targetdesc+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["td"]
  },
  "application/urc-uisocketdesc+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vc": {
    "source": "iana"
  },
  "application/vcard+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vcard+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vemmi": {
    "source": "iana"
  },
  "application/vividence.scriptfile": {
    "source": "apache"
  },
  "application/vnd.1000minds.decision-model+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["1km"]
  },
  "application/vnd.1ob": {
    "source": "iana"
  },
  "application/vnd.3gpp-prose+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp-prose-pc3a+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp-prose-pc3ach+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp-prose-pc3ch+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp-prose-pc8+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp-v2x-local-service-information": {
    "source": "iana"
  },
  "application/vnd.3gpp.5gnas": {
    "source": "iana"
  },
  "application/vnd.3gpp.5gsa2x": {
    "source": "iana"
  },
  "application/vnd.3gpp.5gsa2x-local-service-information": {
    "source": "iana"
  },
  "application/vnd.3gpp.access-transfer-events+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.bsf+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.crs+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.current-location-discovery+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.gmop+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.gtpc": {
    "source": "iana"
  },
  "application/vnd.3gpp.interworking-data": {
    "source": "iana"
  },
  "application/vnd.3gpp.lpp": {
    "source": "iana"
  },
  "application/vnd.3gpp.mc-signalling-ear": {
    "source": "iana"
  },
  "application/vnd.3gpp.mcdata-affiliation-command+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcdata-info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcdata-msgstore-ctrl-request+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcdata-payload": {
    "source": "iana"
  },
  "application/vnd.3gpp.mcdata-regroup+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcdata-service-config+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcdata-signalling": {
    "source": "iana"
  },
  "application/vnd.3gpp.mcdata-ue-config+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcdata-user-profile+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcptt-affiliation-command+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcptt-floor-request+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcptt-info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcptt-location-info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcptt-mbms-usage-info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcptt-regroup+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcptt-service-config+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcptt-signed+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcptt-ue-config+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcptt-ue-init-config+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcptt-user-profile+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcvideo-affiliation-command+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcvideo-info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcvideo-location-info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcvideo-mbms-usage-info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcvideo-regroup+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcvideo-service-config+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcvideo-transmission-request+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcvideo-ue-config+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mcvideo-user-profile+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.mid-call+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.ngap": {
    "source": "iana"
  },
  "application/vnd.3gpp.pfcp": {
    "source": "iana"
  },
  "application/vnd.3gpp.pic-bw-large": {
    "source": "iana",
    "extensions": ["plb"]
  },
  "application/vnd.3gpp.pic-bw-small": {
    "source": "iana",
    "extensions": ["psb"]
  },
  "application/vnd.3gpp.pic-bw-var": {
    "source": "iana",
    "extensions": ["pvb"]
  },
  "application/vnd.3gpp.pinapp-info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.s1ap": {
    "source": "iana"
  },
  "application/vnd.3gpp.seal-group-doc+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.seal-info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.seal-location-info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.seal-mbms-usage-info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.seal-network-qos-management-info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.seal-ue-config-info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.seal-unicast-info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.seal-user-profile-info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.sms": {
    "source": "iana"
  },
  "application/vnd.3gpp.sms+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.srvcc-ext+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.srvcc-info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.state-and-event-info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.ussd+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp.v2x": {
    "source": "iana"
  },
  "application/vnd.3gpp.vae-info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp2.bcmcsinfo+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.3gpp2.sms": {
    "source": "iana"
  },
  "application/vnd.3gpp2.tcap": {
    "source": "iana",
    "extensions": ["tcap"]
  },
  "application/vnd.3lightssoftware.imagescal": {
    "source": "iana"
  },
  "application/vnd.3m.post-it-notes": {
    "source": "iana",
    "extensions": ["pwn"]
  },
  "application/vnd.accpac.simply.aso": {
    "source": "iana",
    "extensions": ["aso"]
  },
  "application/vnd.accpac.simply.imp": {
    "source": "iana",
    "extensions": ["imp"]
  },
  "application/vnd.acm.addressxfer+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.acm.chatbot+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.acucobol": {
    "source": "iana",
    "extensions": ["acu"]
  },
  "application/vnd.acucorp": {
    "source": "iana",
    "extensions": ["atc", "acutc"]
  },
  "application/vnd.adobe.air-application-installer-package+zip": {
    "source": "apache",
    "compressible": false,
    "extensions": ["air"]
  },
  "application/vnd.adobe.flash.movie": {
    "source": "iana"
  },
  "application/vnd.adobe.formscentral.fcdt": {
    "source": "iana",
    "extensions": ["fcdt"]
  },
  "application/vnd.adobe.fxp": {
    "source": "iana",
    "extensions": ["fxp", "fxpl"]
  },
  "application/vnd.adobe.partial-upload": {
    "source": "iana"
  },
  "application/vnd.adobe.xdp+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["xdp"]
  },
  "application/vnd.adobe.xfdf": {
    "source": "apache",
    "extensions": ["xfdf"]
  },
  "application/vnd.aether.imp": {
    "source": "iana"
  },
  "application/vnd.afpc.afplinedata": {
    "source": "iana"
  },
  "application/vnd.afpc.afplinedata-pagedef": {
    "source": "iana"
  },
  "application/vnd.afpc.cmoca-cmresource": {
    "source": "iana"
  },
  "application/vnd.afpc.foca-charset": {
    "source": "iana"
  },
  "application/vnd.afpc.foca-codedfont": {
    "source": "iana"
  },
  "application/vnd.afpc.foca-codepage": {
    "source": "iana"
  },
  "application/vnd.afpc.modca": {
    "source": "iana"
  },
  "application/vnd.afpc.modca-cmtable": {
    "source": "iana"
  },
  "application/vnd.afpc.modca-formdef": {
    "source": "iana"
  },
  "application/vnd.afpc.modca-mediummap": {
    "source": "iana"
  },
  "application/vnd.afpc.modca-objectcontainer": {
    "source": "iana"
  },
  "application/vnd.afpc.modca-overlay": {
    "source": "iana"
  },
  "application/vnd.afpc.modca-pagesegment": {
    "source": "iana"
  },
  "application/vnd.age": {
    "source": "iana",
    "extensions": ["age"]
  },
  "application/vnd.ah-barcode": {
    "source": "apache"
  },
  "application/vnd.ahead.space": {
    "source": "iana",
    "extensions": ["ahead"]
  },
  "application/vnd.airzip.filesecure.azf": {
    "source": "iana",
    "extensions": ["azf"]
  },
  "application/vnd.airzip.filesecure.azs": {
    "source": "iana",
    "extensions": ["azs"]
  },
  "application/vnd.amadeus+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.amazon.ebook": {
    "source": "apache",
    "extensions": ["azw"]
  },
  "application/vnd.amazon.mobi8-ebook": {
    "source": "iana"
  },
  "application/vnd.americandynamics.acc": {
    "source": "iana",
    "extensions": ["acc"]
  },
  "application/vnd.amiga.ami": {
    "source": "iana",
    "extensions": ["ami"]
  },
  "application/vnd.amundsen.maze+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.android.ota": {
    "source": "iana"
  },
  "application/vnd.android.package-archive": {
    "source": "apache",
    "compressible": false,
    "extensions": ["apk"]
  },
  "application/vnd.anki": {
    "source": "iana"
  },
  "application/vnd.anser-web-certificate-issue-initiation": {
    "source": "iana",
    "extensions": ["cii"]
  },
  "application/vnd.anser-web-funds-transfer-initiation": {
    "source": "apache",
    "extensions": ["fti"]
  },
  "application/vnd.antix.game-component": {
    "source": "iana",
    "extensions": ["atx"]
  },
  "application/vnd.apache.arrow.file": {
    "source": "iana"
  },
  "application/vnd.apache.arrow.stream": {
    "source": "iana"
  },
  "application/vnd.apache.parquet": {
    "source": "iana"
  },
  "application/vnd.apache.thrift.binary": {
    "source": "iana"
  },
  "application/vnd.apache.thrift.compact": {
    "source": "iana"
  },
  "application/vnd.apache.thrift.json": {
    "source": "iana"
  },
  "application/vnd.apexlang": {
    "source": "iana"
  },
  "application/vnd.api+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.aplextor.warrp+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.apothekende.reservation+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.apple.installer+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["mpkg"]
  },
  "application/vnd.apple.keynote": {
    "source": "iana",
    "extensions": ["key"]
  },
  "application/vnd.apple.mpegurl": {
    "source": "iana",
    "extensions": ["m3u8"]
  },
  "application/vnd.apple.numbers": {
    "source": "iana",
    "extensions": ["numbers"]
  },
  "application/vnd.apple.pages": {
    "source": "iana",
    "extensions": ["pages"]
  },
  "application/vnd.apple.pkpass": {
    "compressible": false,
    "extensions": ["pkpass"]
  },
  "application/vnd.arastra.swi": {
    "source": "apache"
  },
  "application/vnd.aristanetworks.swi": {
    "source": "iana",
    "extensions": ["swi"]
  },
  "application/vnd.artisan+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.artsquare": {
    "source": "iana"
  },
  "application/vnd.astraea-software.iota": {
    "source": "iana",
    "extensions": ["iota"]
  },
  "application/vnd.audiograph": {
    "source": "iana",
    "extensions": ["aep"]
  },
  "application/vnd.autopackage": {
    "source": "iana"
  },
  "application/vnd.avalon+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.avistar+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.balsamiq.bmml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["bmml"]
  },
  "application/vnd.balsamiq.bmpr": {
    "source": "iana"
  },
  "application/vnd.banana-accounting": {
    "source": "iana"
  },
  "application/vnd.bbf.usp.error": {
    "source": "iana"
  },
  "application/vnd.bbf.usp.msg": {
    "source": "iana"
  },
  "application/vnd.bbf.usp.msg+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.bekitzur-stech+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.belightsoft.lhzd+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/vnd.belightsoft.lhzl+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/vnd.bint.med-content": {
    "source": "iana"
  },
  "application/vnd.biopax.rdf+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.blink-idb-value-wrapper": {
    "source": "iana"
  },
  "application/vnd.blueice.multipass": {
    "source": "iana",
    "extensions": ["mpm"]
  },
  "application/vnd.bluetooth.ep.oob": {
    "source": "iana"
  },
  "application/vnd.bluetooth.le.oob": {
    "source": "iana"
  },
  "application/vnd.bmi": {
    "source": "iana",
    "extensions": ["bmi"]
  },
  "application/vnd.bpf": {
    "source": "iana"
  },
  "application/vnd.bpf3": {
    "source": "iana"
  },
  "application/vnd.businessobjects": {
    "source": "iana",
    "extensions": ["rep"]
  },
  "application/vnd.byu.uapi+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.bzip3": {
    "source": "iana"
  },
  "application/vnd.c3voc.schedule+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.cab-jscript": {
    "source": "iana"
  },
  "application/vnd.canon-cpdl": {
    "source": "iana"
  },
  "application/vnd.canon-lips": {
    "source": "iana"
  },
  "application/vnd.capasystems-pg+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.cendio.thinlinc.clientconf": {
    "source": "iana"
  },
  "application/vnd.century-systems.tcp_stream": {
    "source": "iana"
  },
  "application/vnd.chemdraw+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["cdxml"]
  },
  "application/vnd.chess-pgn": {
    "source": "iana"
  },
  "application/vnd.chipnuts.karaoke-mmd": {
    "source": "iana",
    "extensions": ["mmd"]
  },
  "application/vnd.ciedi": {
    "source": "iana"
  },
  "application/vnd.cinderella": {
    "source": "iana",
    "extensions": ["cdy"]
  },
  "application/vnd.cirpack.isdn-ext": {
    "source": "iana"
  },
  "application/vnd.citationstyles.style+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["csl"]
  },
  "application/vnd.claymore": {
    "source": "iana",
    "extensions": ["cla"]
  },
  "application/vnd.cloanto.rp9": {
    "source": "iana",
    "extensions": ["rp9"]
  },
  "application/vnd.clonk.c4group": {
    "source": "iana",
    "extensions": ["c4g", "c4d", "c4f", "c4p", "c4u"]
  },
  "application/vnd.cluetrust.cartomobile-config": {
    "source": "iana",
    "extensions": ["c11amc"]
  },
  "application/vnd.cluetrust.cartomobile-config-pkg": {
    "source": "iana",
    "extensions": ["c11amz"]
  },
  "application/vnd.cncf.helm.chart.content.v1.tar+gzip": {
    "source": "iana"
  },
  "application/vnd.cncf.helm.chart.provenance.v1.prov": {
    "source": "iana"
  },
  "application/vnd.cncf.helm.config.v1+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.coffeescript": {
    "source": "iana"
  },
  "application/vnd.collabio.xodocuments.document": {
    "source": "iana"
  },
  "application/vnd.collabio.xodocuments.document-template": {
    "source": "iana"
  },
  "application/vnd.collabio.xodocuments.presentation": {
    "source": "iana"
  },
  "application/vnd.collabio.xodocuments.presentation-template": {
    "source": "iana"
  },
  "application/vnd.collabio.xodocuments.spreadsheet": {
    "source": "iana"
  },
  "application/vnd.collabio.xodocuments.spreadsheet-template": {
    "source": "iana"
  },
  "application/vnd.collection+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.collection.doc+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.collection.next+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.comicbook+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/vnd.comicbook-rar": {
    "source": "iana"
  },
  "application/vnd.commerce-battelle": {
    "source": "iana"
  },
  "application/vnd.commonspace": {
    "source": "iana",
    "extensions": ["csp"]
  },
  "application/vnd.contact.cmsg": {
    "source": "iana",
    "extensions": ["cdbcmsg"]
  },
  "application/vnd.coreos.ignition+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.cosmocaller": {
    "source": "iana",
    "extensions": ["cmc"]
  },
  "application/vnd.crick.clicker": {
    "source": "iana",
    "extensions": ["clkx"]
  },
  "application/vnd.crick.clicker.keyboard": {
    "source": "iana",
    "extensions": ["clkk"]
  },
  "application/vnd.crick.clicker.palette": {
    "source": "iana",
    "extensions": ["clkp"]
  },
  "application/vnd.crick.clicker.template": {
    "source": "iana",
    "extensions": ["clkt"]
  },
  "application/vnd.crick.clicker.wordbank": {
    "source": "iana",
    "extensions": ["clkw"]
  },
  "application/vnd.criticaltools.wbs+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["wbs"]
  },
  "application/vnd.cryptii.pipe+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.crypto-shade-file": {
    "source": "iana"
  },
  "application/vnd.cryptomator.encrypted": {
    "source": "iana"
  },
  "application/vnd.cryptomator.vault": {
    "source": "iana"
  },
  "application/vnd.ctc-posml": {
    "source": "iana",
    "extensions": ["pml"]
  },
  "application/vnd.ctct.ws+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.cups-pdf": {
    "source": "iana"
  },
  "application/vnd.cups-postscript": {
    "source": "iana"
  },
  "application/vnd.cups-ppd": {
    "source": "iana",
    "extensions": ["ppd"]
  },
  "application/vnd.cups-raster": {
    "source": "iana"
  },
  "application/vnd.cups-raw": {
    "source": "iana"
  },
  "application/vnd.curl": {
    "source": "iana"
  },
  "application/vnd.curl.car": {
    "source": "apache",
    "extensions": ["car"]
  },
  "application/vnd.curl.pcurl": {
    "source": "apache",
    "extensions": ["pcurl"]
  },
  "application/vnd.cyan.dean.root+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.cybank": {
    "source": "iana"
  },
  "application/vnd.cyclonedx+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.cyclonedx+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.d2l.coursepackage1p0+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/vnd.d3m-dataset": {
    "source": "iana"
  },
  "application/vnd.d3m-problem": {
    "source": "iana"
  },
  "application/vnd.dart": {
    "source": "iana",
    "compressible": true,
    "extensions": ["dart"]
  },
  "application/vnd.data-vision.rdz": {
    "source": "iana",
    "extensions": ["rdz"]
  },
  "application/vnd.datalog": {
    "source": "iana"
  },
  "application/vnd.datapackage+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.dataresource+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.dbf": {
    "source": "iana",
    "extensions": ["dbf"]
  },
  "application/vnd.debian.binary-package": {
    "source": "iana"
  },
  "application/vnd.dece.data": {
    "source": "iana",
    "extensions": ["uvf", "uvvf", "uvd", "uvvd"]
  },
  "application/vnd.dece.ttml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["uvt", "uvvt"]
  },
  "application/vnd.dece.unspecified": {
    "source": "iana",
    "extensions": ["uvx", "uvvx"]
  },
  "application/vnd.dece.zip": {
    "source": "iana",
    "extensions": ["uvz", "uvvz"]
  },
  "application/vnd.denovo.fcselayout-link": {
    "source": "iana",
    "extensions": ["fe_launch"]
  },
  "application/vnd.desmume.movie": {
    "source": "iana"
  },
  "application/vnd.dir-bi.plate-dl-nosuffix": {
    "source": "iana"
  },
  "application/vnd.dm.delegation+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.dna": {
    "source": "iana",
    "extensions": ["dna"]
  },
  "application/vnd.document+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.dolby.mlp": {
    "source": "apache",
    "extensions": ["mlp"]
  },
  "application/vnd.dolby.mobile.1": {
    "source": "iana"
  },
  "application/vnd.dolby.mobile.2": {
    "source": "iana"
  },
  "application/vnd.doremir.scorecloud-binary-document": {
    "source": "iana"
  },
  "application/vnd.dpgraph": {
    "source": "iana",
    "extensions": ["dpg"]
  },
  "application/vnd.dreamfactory": {
    "source": "iana",
    "extensions": ["dfac"]
  },
  "application/vnd.drive+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.ds-keypoint": {
    "source": "apache",
    "extensions": ["kpxx"]
  },
  "application/vnd.dtg.local": {
    "source": "iana"
  },
  "application/vnd.dtg.local.flash": {
    "source": "iana"
  },
  "application/vnd.dtg.local.html": {
    "source": "iana"
  },
  "application/vnd.dvb.ait": {
    "source": "iana",
    "extensions": ["ait"]
  },
  "application/vnd.dvb.dvbisl+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.dvb.dvbj": {
    "source": "iana"
  },
  "application/vnd.dvb.esgcontainer": {
    "source": "iana"
  },
  "application/vnd.dvb.ipdcdftnotifaccess": {
    "source": "iana"
  },
  "application/vnd.dvb.ipdcesgaccess": {
    "source": "iana"
  },
  "application/vnd.dvb.ipdcesgaccess2": {
    "source": "iana"
  },
  "application/vnd.dvb.ipdcesgpdd": {
    "source": "iana"
  },
  "application/vnd.dvb.ipdcroaming": {
    "source": "iana"
  },
  "application/vnd.dvb.iptv.alfec-base": {
    "source": "iana"
  },
  "application/vnd.dvb.iptv.alfec-enhancement": {
    "source": "iana"
  },
  "application/vnd.dvb.notif-aggregate-root+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.dvb.notif-container+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.dvb.notif-generic+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.dvb.notif-ia-msglist+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.dvb.notif-ia-registration-request+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.dvb.notif-ia-registration-response+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.dvb.notif-init+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.dvb.pfr": {
    "source": "iana"
  },
  "application/vnd.dvb.service": {
    "source": "iana",
    "extensions": ["svc"]
  },
  "application/vnd.dxr": {
    "source": "iana"
  },
  "application/vnd.dynageo": {
    "source": "iana",
    "extensions": ["geo"]
  },
  "application/vnd.dzr": {
    "source": "iana"
  },
  "application/vnd.easykaraoke.cdgdownload": {
    "source": "iana"
  },
  "application/vnd.ecdis-update": {
    "source": "iana"
  },
  "application/vnd.ecip.rlp": {
    "source": "iana"
  },
  "application/vnd.eclipse.ditto+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.ecowin.chart": {
    "source": "iana",
    "extensions": ["mag"]
  },
  "application/vnd.ecowin.filerequest": {
    "source": "iana"
  },
  "application/vnd.ecowin.fileupdate": {
    "source": "iana"
  },
  "application/vnd.ecowin.series": {
    "source": "iana"
  },
  "application/vnd.ecowin.seriesrequest": {
    "source": "iana"
  },
  "application/vnd.ecowin.seriesupdate": {
    "source": "iana"
  },
  "application/vnd.efi.img": {
    "source": "iana"
  },
  "application/vnd.efi.iso": {
    "source": "iana"
  },
  "application/vnd.eln+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/vnd.emclient.accessrequest+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.enliven": {
    "source": "iana",
    "extensions": ["nml"]
  },
  "application/vnd.enphase.envoy": {
    "source": "iana"
  },
  "application/vnd.eprints.data+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.epson.esf": {
    "source": "iana",
    "extensions": ["esf"]
  },
  "application/vnd.epson.msf": {
    "source": "iana",
    "extensions": ["msf"]
  },
  "application/vnd.epson.quickanime": {
    "source": "iana",
    "extensions": ["qam"]
  },
  "application/vnd.epson.salt": {
    "source": "iana",
    "extensions": ["slt"]
  },
  "application/vnd.epson.ssf": {
    "source": "iana",
    "extensions": ["ssf"]
  },
  "application/vnd.ericsson.quickcall": {
    "source": "iana"
  },
  "application/vnd.erofs": {
    "source": "iana"
  },
  "application/vnd.espass-espass+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/vnd.eszigno3+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["es3", "et3"]
  },
  "application/vnd.etsi.aoc+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.asic-e+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/vnd.etsi.asic-s+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/vnd.etsi.cug+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.iptvcommand+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.iptvdiscovery+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.iptvprofile+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.iptvsad-bc+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.iptvsad-cod+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.iptvsad-npvr+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.iptvservice+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.iptvsync+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.iptvueprofile+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.mcid+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.mheg5": {
    "source": "iana"
  },
  "application/vnd.etsi.overload-control-policy-dataset+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.pstn+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.sci+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.simservs+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.timestamp-token": {
    "source": "iana"
  },
  "application/vnd.etsi.tsl+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.etsi.tsl.der": {
    "source": "iana"
  },
  "application/vnd.eu.kasparian.car+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.eudora.data": {
    "source": "iana"
  },
  "application/vnd.evolv.ecig.profile": {
    "source": "iana"
  },
  "application/vnd.evolv.ecig.settings": {
    "source": "iana"
  },
  "application/vnd.evolv.ecig.theme": {
    "source": "iana"
  },
  "application/vnd.exstream-empower+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/vnd.exstream-package": {
    "source": "iana"
  },
  "application/vnd.ezpix-album": {
    "source": "iana",
    "extensions": ["ez2"]
  },
  "application/vnd.ezpix-package": {
    "source": "iana",
    "extensions": ["ez3"]
  },
  "application/vnd.f-secure.mobile": {
    "source": "iana"
  },
  "application/vnd.familysearch.gedcom+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/vnd.fastcopy-disk-image": {
    "source": "iana"
  },
  "application/vnd.fdf": {
    "source": "apache",
    "extensions": ["fdf"]
  },
  "application/vnd.fdsn.mseed": {
    "source": "iana",
    "extensions": ["mseed"]
  },
  "application/vnd.fdsn.seed": {
    "source": "iana",
    "extensions": ["seed", "dataless"]
  },
  "application/vnd.ffsns": {
    "source": "iana"
  },
  "application/vnd.ficlab.flb+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/vnd.filmit.zfc": {
    "source": "iana"
  },
  "application/vnd.fints": {
    "source": "iana"
  },
  "application/vnd.firemonkeys.cloudcell": {
    "source": "iana"
  },
  "application/vnd.flographit": {
    "source": "iana",
    "extensions": ["gph"]
  },
  "application/vnd.fluxtime.clip": {
    "source": "iana",
    "extensions": ["ftc"]
  },
  "application/vnd.font-fontforge-sfd": {
    "source": "iana"
  },
  "application/vnd.framemaker": {
    "source": "iana",
    "extensions": ["fm", "frame", "maker", "book"]
  },
  "application/vnd.freelog.comic": {
    "source": "iana"
  },
  "application/vnd.frogans.fnc": {
    "source": "apache",
    "extensions": ["fnc"]
  },
  "application/vnd.frogans.ltf": {
    "source": "apache",
    "extensions": ["ltf"]
  },
  "application/vnd.fsc.weblaunch": {
    "source": "iana",
    "extensions": ["fsc"]
  },
  "application/vnd.fujifilm.fb.docuworks": {
    "source": "iana"
  },
  "application/vnd.fujifilm.fb.docuworks.binder": {
    "source": "iana"
  },
  "application/vnd.fujifilm.fb.docuworks.container": {
    "source": "iana"
  },
  "application/vnd.fujifilm.fb.jfi+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.fujitsu.oasys": {
    "source": "iana",
    "extensions": ["oas"]
  },
  "application/vnd.fujitsu.oasys2": {
    "source": "iana",
    "extensions": ["oa2"]
  },
  "application/vnd.fujitsu.oasys3": {
    "source": "iana",
    "extensions": ["oa3"]
  },
  "application/vnd.fujitsu.oasysgp": {
    "source": "iana",
    "extensions": ["fg5"]
  },
  "application/vnd.fujitsu.oasysprs": {
    "source": "iana",
    "extensions": ["bh2"]
  },
  "application/vnd.fujixerox.art-ex": {
    "source": "iana"
  },
  "application/vnd.fujixerox.art4": {
    "source": "iana"
  },
  "application/vnd.fujixerox.ddd": {
    "source": "iana",
    "extensions": ["ddd"]
  },
  "application/vnd.fujixerox.docuworks": {
    "source": "iana",
    "extensions": ["xdw"]
  },
  "application/vnd.fujixerox.docuworks.binder": {
    "source": "iana",
    "extensions": ["xbd"]
  },
  "application/vnd.fujixerox.docuworks.container": {
    "source": "iana"
  },
  "application/vnd.fujixerox.hbpl": {
    "source": "iana"
  },
  "application/vnd.fut-misnet": {
    "source": "iana"
  },
  "application/vnd.futoin+cbor": {
    "source": "iana"
  },
  "application/vnd.futoin+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.fuzzysheet": {
    "source": "iana",
    "extensions": ["fzs"]
  },
  "application/vnd.ga4gh.passport+jwt": {
    "source": "iana"
  },
  "application/vnd.genomatix.tuxedo": {
    "source": "iana",
    "extensions": ["txd"]
  },
  "application/vnd.genozip": {
    "source": "iana"
  },
  "application/vnd.gentics.grd+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.gentoo.catmetadata+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.gentoo.ebuild": {
    "source": "iana"
  },
  "application/vnd.gentoo.eclass": {
    "source": "iana"
  },
  "application/vnd.gentoo.gpkg": {
    "source": "iana"
  },
  "application/vnd.gentoo.manifest": {
    "source": "iana"
  },
  "application/vnd.gentoo.pkgmetadata+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.gentoo.xpak": {
    "source": "iana"
  },
  "application/vnd.geo+json": {
    "source": "apache",
    "compressible": true
  },
  "application/vnd.geocube+xml": {
    "source": "apache",
    "compressible": true
  },
  "application/vnd.geogebra.file": {
    "source": "iana",
    "extensions": ["ggb"]
  },
  "application/vnd.geogebra.slides": {
    "source": "iana",
    "extensions": ["ggs"]
  },
  "application/vnd.geogebra.tool": {
    "source": "iana",
    "extensions": ["ggt"]
  },
  "application/vnd.geometry-explorer": {
    "source": "iana",
    "extensions": ["gex", "gre"]
  },
  "application/vnd.geonext": {
    "source": "iana",
    "extensions": ["gxt"]
  },
  "application/vnd.geoplan": {
    "source": "iana",
    "extensions": ["g2w"]
  },
  "application/vnd.geospace": {
    "source": "iana",
    "extensions": ["g3w"]
  },
  "application/vnd.gerber": {
    "source": "iana"
  },
  "application/vnd.globalplatform.card-content-mgt": {
    "source": "iana"
  },
  "application/vnd.globalplatform.card-content-mgt-response": {
    "source": "iana"
  },
  "application/vnd.gmx": {
    "source": "iana",
    "extensions": ["gmx"]
  },
  "application/vnd.gnu.taler.exchange+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.gnu.taler.merchant+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.google-apps.document": {
    "compressible": false,
    "extensions": ["gdoc"]
  },
  "application/vnd.google-apps.presentation": {
    "compressible": false,
    "extensions": ["gslides"]
  },
  "application/vnd.google-apps.spreadsheet": {
    "compressible": false,
    "extensions": ["gsheet"]
  },
  "application/vnd.google-earth.kml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["kml"]
  },
  "application/vnd.google-earth.kmz": {
    "source": "iana",
    "compressible": false,
    "extensions": ["kmz"]
  },
  "application/vnd.gov.sk.e-form+xml": {
    "source": "apache",
    "compressible": true
  },
  "application/vnd.gov.sk.e-form+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/vnd.gov.sk.xmldatacontainer+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["xdcf"]
  },
  "application/vnd.gpxsee.map+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.grafeq": {
    "source": "iana",
    "extensions": ["gqf", "gqs"]
  },
  "application/vnd.gridmp": {
    "source": "iana"
  },
  "application/vnd.groove-account": {
    "source": "iana",
    "extensions": ["gac"]
  },
  "application/vnd.groove-help": {
    "source": "iana",
    "extensions": ["ghf"]
  },
  "application/vnd.groove-identity-message": {
    "source": "iana",
    "extensions": ["gim"]
  },
  "application/vnd.groove-injector": {
    "source": "iana",
    "extensions": ["grv"]
  },
  "application/vnd.groove-tool-message": {
    "source": "iana",
    "extensions": ["gtm"]
  },
  "application/vnd.groove-tool-template": {
    "source": "iana",
    "extensions": ["tpl"]
  },
  "application/vnd.groove-vcard": {
    "source": "iana",
    "extensions": ["vcg"]
  },
  "application/vnd.hal+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.hal+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["hal"]
  },
  "application/vnd.handheld-entertainment+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["zmm"]
  },
  "application/vnd.hbci": {
    "source": "iana",
    "extensions": ["hbci"]
  },
  "application/vnd.hc+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.hcl-bireports": {
    "source": "iana"
  },
  "application/vnd.hdt": {
    "source": "iana"
  },
  "application/vnd.heroku+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.hhe.lesson-player": {
    "source": "iana",
    "extensions": ["les"]
  },
  "application/vnd.hp-hpgl": {
    "source": "iana",
    "extensions": ["hpgl"]
  },
  "application/vnd.hp-hpid": {
    "source": "iana",
    "extensions": ["hpid"]
  },
  "application/vnd.hp-hps": {
    "source": "iana",
    "extensions": ["hps"]
  },
  "application/vnd.hp-jlyt": {
    "source": "iana",
    "extensions": ["jlt"]
  },
  "application/vnd.hp-pcl": {
    "source": "iana",
    "extensions": ["pcl"]
  },
  "application/vnd.hp-pclxl": {
    "source": "iana",
    "extensions": ["pclxl"]
  },
  "application/vnd.hsl": {
    "source": "iana"
  },
  "application/vnd.httphone": {
    "source": "iana"
  },
  "application/vnd.hydrostatix.sof-data": {
    "source": "iana",
    "extensions": ["sfd-hdstx"]
  },
  "application/vnd.hyper+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.hyper-item+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.hyperdrive+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.hzn-3d-crossword": {
    "source": "iana"
  },
  "application/vnd.ibm.afplinedata": {
    "source": "apache"
  },
  "application/vnd.ibm.electronic-media": {
    "source": "iana"
  },
  "application/vnd.ibm.minipay": {
    "source": "iana",
    "extensions": ["mpy"]
  },
  "application/vnd.ibm.modcap": {
    "source": "apache",
    "extensions": ["afp", "listafp", "list3820"]
  },
  "application/vnd.ibm.rights-management": {
    "source": "iana",
    "extensions": ["irm"]
  },
  "application/vnd.ibm.secure-container": {
    "source": "iana",
    "extensions": ["sc"]
  },
  "application/vnd.iccprofile": {
    "source": "iana",
    "extensions": ["icc", "icm"]
  },
  "application/vnd.ieee.1905": {
    "source": "iana"
  },
  "application/vnd.igloader": {
    "source": "iana",
    "extensions": ["igl"]
  },
  "application/vnd.imagemeter.folder+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/vnd.imagemeter.image+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/vnd.immervision-ivp": {
    "source": "iana",
    "extensions": ["ivp"]
  },
  "application/vnd.immervision-ivu": {
    "source": "iana",
    "extensions": ["ivu"]
  },
  "application/vnd.ims.imsccv1p1": {
    "source": "iana"
  },
  "application/vnd.ims.imsccv1p2": {
    "source": "iana"
  },
  "application/vnd.ims.imsccv1p3": {
    "source": "iana"
  },
  "application/vnd.ims.lis.v2.result+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.ims.lti.v2.toolconsumerprofile+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.ims.lti.v2.toolproxy+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.ims.lti.v2.toolproxy.id+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.ims.lti.v2.toolsettings+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.ims.lti.v2.toolsettings.simple+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.informedcontrol.rms+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.informix-visionary": {
    "source": "apache"
  },
  "application/vnd.infotech.project": {
    "source": "iana"
  },
  "application/vnd.infotech.project+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.innopath.wamp.notification": {
    "source": "iana"
  },
  "application/vnd.insors.igm": {
    "source": "iana",
    "extensions": ["igm"]
  },
  "application/vnd.intercon.formnet": {
    "source": "iana",
    "extensions": ["xpw", "xpx"]
  },
  "application/vnd.intergeo": {
    "source": "iana",
    "extensions": ["i2g"]
  },
  "application/vnd.intertrust.digibox": {
    "source": "iana"
  },
  "application/vnd.intertrust.nncp": {
    "source": "iana"
  },
  "application/vnd.intu.qbo": {
    "source": "iana",
    "extensions": ["qbo"]
  },
  "application/vnd.intu.qfx": {
    "source": "iana",
    "extensions": ["qfx"]
  },
  "application/vnd.ipfs.ipns-record": {
    "source": "iana"
  },
  "application/vnd.ipld.car": {
    "source": "iana"
  },
  "application/vnd.ipld.dag-cbor": {
    "source": "iana"
  },
  "application/vnd.ipld.dag-json": {
    "source": "iana"
  },
  "application/vnd.ipld.raw": {
    "source": "iana"
  },
  "application/vnd.iptc.g2.catalogitem+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.iptc.g2.conceptitem+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.iptc.g2.knowledgeitem+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.iptc.g2.newsitem+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.iptc.g2.newsmessage+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.iptc.g2.packageitem+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.iptc.g2.planningitem+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.ipunplugged.rcprofile": {
    "source": "iana",
    "extensions": ["rcprofile"]
  },
  "application/vnd.irepository.package+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["irp"]
  },
  "application/vnd.is-xpr": {
    "source": "iana",
    "extensions": ["xpr"]
  },
  "application/vnd.isac.fcs": {
    "source": "iana",
    "extensions": ["fcs"]
  },
  "application/vnd.iso11783-10+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/vnd.jam": {
    "source": "iana",
    "extensions": ["jam"]
  },
  "application/vnd.japannet-directory-service": {
    "source": "iana"
  },
  "application/vnd.japannet-jpnstore-wakeup": {
    "source": "iana"
  },
  "application/vnd.japannet-payment-wakeup": {
    "source": "iana"
  },
  "application/vnd.japannet-registration": {
    "source": "iana"
  },
  "application/vnd.japannet-registration-wakeup": {
    "source": "iana"
  },
  "application/vnd.japannet-setstore-wakeup": {
    "source": "iana"
  },
  "application/vnd.japannet-verification": {
    "source": "iana"
  },
  "application/vnd.japannet-verification-wakeup": {
    "source": "iana"
  },
  "application/vnd.jcp.javame.midlet-rms": {
    "source": "iana",
    "extensions": ["rms"]
  },
  "application/vnd.jisp": {
    "source": "iana",
    "extensions": ["jisp"]
  },
  "application/vnd.joost.joda-archive": {
    "source": "iana",
    "extensions": ["joda"]
  },
  "application/vnd.jsk.isdn-ngn": {
    "source": "iana"
  },
  "application/vnd.kahootz": {
    "source": "iana",
    "extensions": ["ktz", "ktr"]
  },
  "application/vnd.kde.karbon": {
    "source": "iana",
    "extensions": ["karbon"]
  },
  "application/vnd.kde.kchart": {
    "source": "iana",
    "extensions": ["chrt"]
  },
  "application/vnd.kde.kformula": {
    "source": "iana",
    "extensions": ["kfo"]
  },
  "application/vnd.kde.kivio": {
    "source": "iana",
    "extensions": ["flw"]
  },
  "application/vnd.kde.kontour": {
    "source": "iana",
    "extensions": ["kon"]
  },
  "application/vnd.kde.kpresenter": {
    "source": "iana",
    "extensions": ["kpr", "kpt"]
  },
  "application/vnd.kde.kspread": {
    "source": "iana",
    "extensions": ["ksp"]
  },
  "application/vnd.kde.kword": {
    "source": "iana",
    "extensions": ["kwd", "kwt"]
  },
  "application/vnd.kenameaapp": {
    "source": "iana",
    "extensions": ["htke"]
  },
  "application/vnd.kidspiration": {
    "source": "iana",
    "extensions": ["kia"]
  },
  "application/vnd.kinar": {
    "source": "iana",
    "extensions": ["kne", "knp"]
  },
  "application/vnd.koan": {
    "source": "iana",
    "extensions": ["skp", "skd", "skt", "skm"]
  },
  "application/vnd.kodak-descriptor": {
    "source": "iana",
    "extensions": ["sse"]
  },
  "application/vnd.las": {
    "source": "iana"
  },
  "application/vnd.las.las+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.las.las+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["lasxml"]
  },
  "application/vnd.laszip": {
    "source": "iana"
  },
  "application/vnd.ldev.productlicensing": {
    "source": "iana"
  },
  "application/vnd.leap+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.liberty-request+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.llamagraphics.life-balance.desktop": {
    "source": "iana",
    "extensions": ["lbd"]
  },
  "application/vnd.llamagraphics.life-balance.exchange+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["lbe"]
  },
  "application/vnd.logipipe.circuit+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/vnd.loom": {
    "source": "iana"
  },
  "application/vnd.lotus-1-2-3": {
    "source": "iana",
    "extensions": ["123"]
  },
  "application/vnd.lotus-approach": {
    "source": "iana",
    "extensions": ["apr"]
  },
  "application/vnd.lotus-freelance": {
    "source": "iana",
    "extensions": ["pre"]
  },
  "application/vnd.lotus-notes": {
    "source": "iana",
    "extensions": ["nsf"]
  },
  "application/vnd.lotus-organizer": {
    "source": "iana",
    "extensions": ["org"]
  },
  "application/vnd.lotus-screencam": {
    "source": "iana",
    "extensions": ["scm"]
  },
  "application/vnd.lotus-wordpro": {
    "source": "iana",
    "extensions": ["lwp"]
  },
  "application/vnd.macports.portpkg": {
    "source": "iana",
    "extensions": ["portpkg"]
  },
  "application/vnd.mapbox-vector-tile": {
    "source": "iana",
    "extensions": ["mvt"]
  },
  "application/vnd.marlin.drm.actiontoken+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.marlin.drm.conftoken+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.marlin.drm.license+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.marlin.drm.mdcf": {
    "source": "iana"
  },
  "application/vnd.mason+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.maxar.archive.3tz+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/vnd.maxmind.maxmind-db": {
    "source": "iana"
  },
  "application/vnd.mcd": {
    "source": "iana",
    "extensions": ["mcd"]
  },
  "application/vnd.mdl": {
    "source": "iana"
  },
  "application/vnd.mdl-mbsdf": {
    "source": "iana"
  },
  "application/vnd.medcalcdata": {
    "source": "iana",
    "extensions": ["mc1"]
  },
  "application/vnd.mediastation.cdkey": {
    "source": "iana",
    "extensions": ["cdkey"]
  },
  "application/vnd.medicalholodeck.recordxr": {
    "source": "iana"
  },
  "application/vnd.meridian-slingshot": {
    "source": "iana"
  },
  "application/vnd.mermaid": {
    "source": "iana"
  },
  "application/vnd.mfer": {
    "source": "iana",
    "extensions": ["mwf"]
  },
  "application/vnd.mfmp": {
    "source": "iana",
    "extensions": ["mfm"]
  },
  "application/vnd.micro+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.micrografx.flo": {
    "source": "iana",
    "extensions": ["flo"]
  },
  "application/vnd.micrografx.igx": {
    "source": "iana",
    "extensions": ["igx"]
  },
  "application/vnd.microsoft.portable-executable": {
    "source": "iana"
  },
  "application/vnd.microsoft.windows.thumbnail-cache": {
    "source": "iana"
  },
  "application/vnd.miele+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.mif": {
    "source": "iana",
    "extensions": ["mif"]
  },
  "application/vnd.minisoft-hp3000-save": {
    "source": "iana"
  },
  "application/vnd.mitsubishi.misty-guard.trustweb": {
    "source": "iana"
  },
  "application/vnd.mobius.daf": {
    "source": "iana",
    "extensions": ["daf"]
  },
  "application/vnd.mobius.dis": {
    "source": "iana",
    "extensions": ["dis"]
  },
  "application/vnd.mobius.mbk": {
    "source": "iana",
    "extensions": ["mbk"]
  },
  "application/vnd.mobius.mqy": {
    "source": "iana",
    "extensions": ["mqy"]
  },
  "application/vnd.mobius.msl": {
    "source": "iana",
    "extensions": ["msl"]
  },
  "application/vnd.mobius.plc": {
    "source": "iana",
    "extensions": ["plc"]
  },
  "application/vnd.mobius.txf": {
    "source": "iana",
    "extensions": ["txf"]
  },
  "application/vnd.modl": {
    "source": "iana"
  },
  "application/vnd.mophun.application": {
    "source": "iana",
    "extensions": ["mpn"]
  },
  "application/vnd.mophun.certificate": {
    "source": "iana",
    "extensions": ["mpc"]
  },
  "application/vnd.motorola.flexsuite": {
    "source": "iana"
  },
  "application/vnd.motorola.flexsuite.adsi": {
    "source": "iana"
  },
  "application/vnd.motorola.flexsuite.fis": {
    "source": "iana"
  },
  "application/vnd.motorola.flexsuite.gotap": {
    "source": "iana"
  },
  "application/vnd.motorola.flexsuite.kmr": {
    "source": "iana"
  },
  "application/vnd.motorola.flexsuite.ttc": {
    "source": "iana"
  },
  "application/vnd.motorola.flexsuite.wem": {
    "source": "iana"
  },
  "application/vnd.motorola.iprm": {
    "source": "iana"
  },
  "application/vnd.mozilla.xul+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["xul"]
  },
  "application/vnd.ms-3mfdocument": {
    "source": "iana"
  },
  "application/vnd.ms-artgalry": {
    "source": "iana",
    "extensions": ["cil"]
  },
  "application/vnd.ms-asf": {
    "source": "iana"
  },
  "application/vnd.ms-cab-compressed": {
    "source": "iana",
    "extensions": ["cab"]
  },
  "application/vnd.ms-color.iccprofile": {
    "source": "apache"
  },
  "application/vnd.ms-excel": {
    "source": "iana",
    "compressible": false,
    "extensions": ["xls", "xlm", "xla", "xlc", "xlt", "xlw"]
  },
  "application/vnd.ms-excel.addin.macroenabled.12": {
    "source": "iana",
    "extensions": ["xlam"]
  },
  "application/vnd.ms-excel.sheet.binary.macroenabled.12": {
    "source": "iana",
    "extensions": ["xlsb"]
  },
  "application/vnd.ms-excel.sheet.macroenabled.12": {
    "source": "iana",
    "extensions": ["xlsm"]
  },
  "application/vnd.ms-excel.template.macroenabled.12": {
    "source": "iana",
    "extensions": ["xltm"]
  },
  "application/vnd.ms-fontobject": {
    "source": "iana",
    "compressible": true,
    "extensions": ["eot"]
  },
  "application/vnd.ms-htmlhelp": {
    "source": "iana",
    "extensions": ["chm"]
  },
  "application/vnd.ms-ims": {
    "source": "iana",
    "extensions": ["ims"]
  },
  "application/vnd.ms-lrm": {
    "source": "iana",
    "extensions": ["lrm"]
  },
  "application/vnd.ms-office.activex+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.ms-officetheme": {
    "source": "iana",
    "extensions": ["thmx"]
  },
  "application/vnd.ms-opentype": {
    "source": "apache",
    "compressible": true
  },
  "application/vnd.ms-outlook": {
    "compressible": false,
    "extensions": ["msg"]
  },
  "application/vnd.ms-package.obfuscated-opentype": {
    "source": "apache"
  },
  "application/vnd.ms-pki.seccat": {
    "source": "apache",
    "extensions": ["cat"]
  },
  "application/vnd.ms-pki.stl": {
    "source": "apache",
    "extensions": ["stl"]
  },
  "application/vnd.ms-playready.initiator+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.ms-powerpoint": {
    "source": "iana",
    "compressible": false,
    "extensions": ["ppt", "pps", "pot"]
  },
  "application/vnd.ms-powerpoint.addin.macroenabled.12": {
    "source": "iana",
    "extensions": ["ppam"]
  },
  "application/vnd.ms-powerpoint.presentation.macroenabled.12": {
    "source": "iana",
    "extensions": ["pptm"]
  },
  "application/vnd.ms-powerpoint.slide.macroenabled.12": {
    "source": "iana",
    "extensions": ["sldm"]
  },
  "application/vnd.ms-powerpoint.slideshow.macroenabled.12": {
    "source": "iana",
    "extensions": ["ppsm"]
  },
  "application/vnd.ms-powerpoint.template.macroenabled.12": {
    "source": "iana",
    "extensions": ["potm"]
  },
  "application/vnd.ms-printdevicecapabilities+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.ms-printing.printticket+xml": {
    "source": "apache",
    "compressible": true
  },
  "application/vnd.ms-printschematicket+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.ms-project": {
    "source": "iana",
    "extensions": ["mpp", "mpt"]
  },
  "application/vnd.ms-tnef": {
    "source": "iana"
  },
  "application/vnd.ms-windows.devicepairing": {
    "source": "iana"
  },
  "application/vnd.ms-windows.nwprinting.oob": {
    "source": "iana"
  },
  "application/vnd.ms-windows.printerpairing": {
    "source": "iana"
  },
  "application/vnd.ms-windows.wsd.oob": {
    "source": "iana"
  },
  "application/vnd.ms-wmdrm.lic-chlg-req": {
    "source": "iana"
  },
  "application/vnd.ms-wmdrm.lic-resp": {
    "source": "iana"
  },
  "application/vnd.ms-wmdrm.meter-chlg-req": {
    "source": "iana"
  },
  "application/vnd.ms-wmdrm.meter-resp": {
    "source": "iana"
  },
  "application/vnd.ms-word.document.macroenabled.12": {
    "source": "iana",
    "extensions": ["docm"]
  },
  "application/vnd.ms-word.template.macroenabled.12": {
    "source": "iana",
    "extensions": ["dotm"]
  },
  "application/vnd.ms-works": {
    "source": "iana",
    "extensions": ["wps", "wks", "wcm", "wdb"]
  },
  "application/vnd.ms-wpl": {
    "source": "iana",
    "extensions": ["wpl"]
  },
  "application/vnd.ms-xpsdocument": {
    "source": "iana",
    "compressible": false,
    "extensions": ["xps"]
  },
  "application/vnd.msa-disk-image": {
    "source": "iana"
  },
  "application/vnd.mseq": {
    "source": "iana",
    "extensions": ["mseq"]
  },
  "application/vnd.msgpack": {
    "source": "iana"
  },
  "application/vnd.msign": {
    "source": "iana"
  },
  "application/vnd.multiad.creator": {
    "source": "iana"
  },
  "application/vnd.multiad.creator.cif": {
    "source": "iana"
  },
  "application/vnd.music-niff": {
    "source": "iana"
  },
  "application/vnd.musician": {
    "source": "iana",
    "extensions": ["mus"]
  },
  "application/vnd.muvee.style": {
    "source": "iana",
    "extensions": ["msty"]
  },
  "application/vnd.mynfc": {
    "source": "iana",
    "extensions": ["taglet"]
  },
  "application/vnd.nacamar.ybrid+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.nato.bindingdataobject+cbor": {
    "source": "iana"
  },
  "application/vnd.nato.bindingdataobject+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.nato.bindingdataobject+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["bdo"]
  },
  "application/vnd.nato.openxmlformats-package.iepd+zip": {
    "source": "iana",
    "compressible": false
  },
  "application/vnd.ncd.control": {
    "source": "iana"
  },
  "application/vnd.ncd.reference": {
    "source": "iana"
  },
  "application/vnd.nearst.inv+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.nebumind.line": {
    "source": "iana"
  },
  "application/vnd.nervana": {
    "source": "iana"
  },
  "application/vnd.netfpx": {
    "source": "iana"
  },
  "application/vnd.neurolanguage.nlu": {
    "source": "iana",
    "extensions": ["nlu"]
  },
  "application/vnd.nimn": {
    "source": "iana"
  },
  "application/vnd.nintendo.nitro.rom": {
    "source": "iana"
  },
  "application/vnd.nintendo.snes.rom": {
    "source": "iana"
  },
  "application/vnd.nitf": {
    "source": "iana",
    "extensions": ["ntf", "nitf"]
  },
  "application/vnd.noblenet-directory": {
    "source": "iana",
    "extensions": ["nnd"]
  },
  "application/vnd.noblenet-sealer": {
    "source": "iana",
    "extensions": ["nns"]
  },
  "application/vnd.noblenet-web": {
    "source": "iana",
    "extensions": ["nnw"]
  },
  "application/vnd.nokia.catalogs": {
    "source": "iana"
  },
  "application/vnd.nokia.conml+wbxml": {
    "source": "iana"
  },
  "application/vnd.nokia.conml+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.nokia.iptv.config+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.nokia.isds-radio-presets": {
    "source": "iana"
  },
  "application/vnd.nokia.landmark+wbxml": {
    "source": "iana"
  },
  "application/vnd.nokia.landmark+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.nokia.landmarkcollection+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.nokia.n-gage.ac+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["ac"]
  },
  "application/vnd.nokia.n-gage.data": {
    "source": "iana",
    "extensions": ["ngdat"]
  },
  "application/vnd.nokia.n-gage.symbian.install": {
    "source": "apache",
    "extensions": ["n-gage"]
  },
  "application/vnd.nokia.ncd": {
    "source": "iana"
  },
  "application/vnd.nokia.pcd+wbxml": {
    "source": "iana"
  },
  "application/vnd.nokia.pcd+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.nokia.radio-preset": {
    "source": "iana",
    "extensions": ["rpst"]
  },
  "application/vnd.nokia.radio-presets": {
    "source": "iana",
    "extensions": ["rpss"]
  },
  "application/vnd.novadigm.edm": {
    "source": "iana",
    "extensions": ["edm"]
  },
  "application/vnd.novadigm.edx": {
    "source": "iana",
    "extensions": ["edx"]
  },
  "application/vnd.novadigm.ext": {
    "source": "iana",
    "extensions": ["ext"]
  },
  "application/vnd.ntt-local.content-share": {
    "source": "iana"
  },
  "application/vnd.ntt-local.file-transfer": {
    "source": "iana"
  },
  "application/vnd.ntt-local.ogw_remote-access": {
    "source": "iana"
  },
  "application/vnd.ntt-local.sip-ta_remote": {
    "source": "iana"
  },
  "application/vnd.ntt-local.sip-ta_tcp_stream": {
    "source": "iana"
  },
  "application/vnd.oai.workflows": {
    "source": "iana"
  },
  "application/vnd.oai.workflows+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oai.workflows+yaml": {
    "source": "iana"
  },
  "application/vnd.oasis.opendocument.base": {
    "source": "iana"
  },
  "application/vnd.oasis.opendocument.chart": {
    "source": "iana",
    "extensions": ["odc"]
  },
  "application/vnd.oasis.opendocument.chart-template": {
    "source": "iana",
    "extensions": ["otc"]
  },
  "application/vnd.oasis.opendocument.database": {
    "source": "apache",
    "extensions": ["odb"]
  },
  "application/vnd.oasis.opendocument.formula": {
    "source": "iana",
    "extensions": ["odf"]
  },
  "application/vnd.oasis.opendocument.formula-template": {
    "source": "iana",
    "extensions": ["odft"]
  },
  "application/vnd.oasis.opendocument.graphics": {
    "source": "iana",
    "compressible": false,
    "extensions": ["odg"]
  },
  "application/vnd.oasis.opendocument.graphics-template": {
    "source": "iana",
    "extensions": ["otg"]
  },
  "application/vnd.oasis.opendocument.image": {
    "source": "iana",
    "extensions": ["odi"]
  },
  "application/vnd.oasis.opendocument.image-template": {
    "source": "iana",
    "extensions": ["oti"]
  },
  "application/vnd.oasis.opendocument.presentation": {
    "source": "iana",
    "compressible": false,
    "extensions": ["odp"]
  },
  "application/vnd.oasis.opendocument.presentation-template": {
    "source": "iana",
    "extensions": ["otp"]
  },
  "application/vnd.oasis.opendocument.spreadsheet": {
    "source": "iana",
    "compressible": false,
    "extensions": ["ods"]
  },
  "application/vnd.oasis.opendocument.spreadsheet-template": {
    "source": "iana",
    "extensions": ["ots"]
  },
  "application/vnd.oasis.opendocument.text": {
    "source": "iana",
    "compressible": false,
    "extensions": ["odt"]
  },
  "application/vnd.oasis.opendocument.text-master": {
    "source": "iana",
    "extensions": ["odm"]
  },
  "application/vnd.oasis.opendocument.text-master-template": {
    "source": "iana"
  },
  "application/vnd.oasis.opendocument.text-template": {
    "source": "iana",
    "extensions": ["ott"]
  },
  "application/vnd.oasis.opendocument.text-web": {
    "source": "iana",
    "extensions": ["oth"]
  },
  "application/vnd.obn": {
    "source": "iana"
  },
  "application/vnd.ocf+cbor": {
    "source": "iana"
  },
  "application/vnd.oci.image.manifest.v1+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oftn.l10n+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oipf.contentaccessdownload+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oipf.contentaccessstreaming+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oipf.cspg-hexbinary": {
    "source": "iana"
  },
  "application/vnd.oipf.dae.svg+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oipf.dae.xhtml+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oipf.mippvcontrolmessage+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oipf.pae.gem": {
    "source": "iana"
  },
  "application/vnd.oipf.spdiscovery+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oipf.spdlist+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oipf.ueprofile+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oipf.userprofile+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.olpc-sugar": {
    "source": "iana",
    "extensions": ["xo"]
  },
  "application/vnd.oma-scws-config": {
    "source": "iana"
  },
  "application/vnd.oma-scws-http-request": {
    "source": "iana"
  },
  "application/vnd.oma-scws-http-response": {
    "source": "iana"
  },
  "application/vnd.oma.bcast.associated-procedure-parameter+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.bcast.drm-trigger+xml": {
    "source": "apache",
    "compressible": true
  },
  "application/vnd.oma.bcast.imd+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.bcast.ltkm": {
    "source": "iana"
  },
  "application/vnd.oma.bcast.notification+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.bcast.provisioningtrigger": {
    "source": "iana"
  },
  "application/vnd.oma.bcast.sgboot": {
    "source": "iana"
  },
  "application/vnd.oma.bcast.sgdd+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.bcast.sgdu": {
    "source": "iana"
  },
  "application/vnd.oma.bcast.simple-symbol-container": {
    "source": "iana"
  },
  "application/vnd.oma.bcast.smartcard-trigger+xml": {
    "source": "apache",
    "compressible": true
  },
  "application/vnd.oma.bcast.sprov+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.bcast.stkm": {
    "source": "iana"
  },
  "application/vnd.oma.cab-address-book+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.cab-feature-handler+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.cab-pcc+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.cab-subs-invite+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.cab-user-prefs+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.dcd": {
    "source": "iana"
  },
  "application/vnd.oma.dcdc": {
    "source": "iana"
  },
  "application/vnd.oma.dd2+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["dd2"]
  },
  "application/vnd.oma.drm.risd+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.group-usage-list+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.lwm2m+cbor": {
    "source": "iana"
  },
  "application/vnd.oma.lwm2m+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.lwm2m+tlv": {
    "source": "iana"
  },
  "application/vnd.oma.pal+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.poc.detailed-progress-report+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.poc.final-report+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.poc.groups+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.poc.invocation-descriptor+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.poc.optimized-progress-report+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.push": {
    "source": "iana"
  },
  "application/vnd.oma.scidm.messages+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oma.xcap-directory+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.omads-email+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/vnd.omads-file+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/vnd.omads-folder+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/vnd.omaloc-supl-init": {
    "source": "iana"
  },
  "application/vnd.onepager": {
    "source": "iana"
  },
  "application/vnd.onepagertamp": {
    "source": "iana"
  },
  "application/vnd.onepagertamx": {
    "source": "iana"
  },
  "application/vnd.onepagertat": {
    "source": "iana"
  },
  "application/vnd.onepagertatp": {
    "source": "iana"
  },
  "application/vnd.onepagertatx": {
    "source": "iana"
  },
  "application/vnd.onvif.metadata": {
    "source": "iana"
  },
  "application/vnd.openblox.game+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["obgx"]
  },
  "application/vnd.openblox.game-binary": {
    "source": "iana"
  },
  "application/vnd.openeye.oeb": {
    "source": "iana"
  },
  "application/vnd.openofficeorg.extension": {
    "source": "apache",
    "extensions": ["oxt"]
  },
  "application/vnd.openstreetmap.data+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["osm"]
  },
  "application/vnd.opentimestamps.ots": {
    "source": "iana"
  },
  "application/vnd.openxmlformats-officedocument.custom-properties+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.customxmlproperties+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.drawing+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.drawingml.chart+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.drawingml.chartshapes+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.drawingml.diagramcolors+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.drawingml.diagramdata+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.drawingml.diagramlayout+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.drawingml.diagramstyle+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.extended-properties+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.commentauthors+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.comments+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.handoutmaster+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.notesmaster+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.notesslide+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
    "source": "iana",
    "compressible": false,
    "extensions": ["pptx"]
  },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.presprops+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slide": {
    "source": "iana",
    "extensions": ["sldx"]
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slide+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slidelayout+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slidemaster+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slideshow": {
    "source": "iana",
    "extensions": ["ppsx"]
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slideshow.main+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slideupdateinfo+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.tablestyles+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.tags+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.template": {
    "source": "iana",
    "extensions": ["potx"]
  },
  "application/vnd.openxmlformats-officedocument.presentationml.template.main+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.viewprops+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.calcchain+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.chartsheet+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.connections+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.dialogsheet+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.externallink+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcachedefinition+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcacherecords+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.pivottable+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.querytable+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionheaders+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionlog+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sharedstrings+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
    "source": "iana",
    "compressible": false,
    "extensions": ["xlsx"]
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheetmetadata+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.tablesinglecells+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.template": {
    "source": "iana",
    "extensions": ["xltx"]
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.template.main+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.usernames+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.volatiledependencies+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.theme+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.themeoverride+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.vmldrawing": {
    "source": "iana"
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    "source": "iana",
    "compressible": false,
    "extensions": ["docx"]
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document.glossary+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.endnotes+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.fonttable+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.template": {
    "source": "iana",
    "extensions": ["dotx"]
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.websettings+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-package.core-properties+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-package.digital-signature-xmlsignature+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.openxmlformats-package.relationships+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oracle.resource+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.orange.indata": {
    "source": "iana"
  },
  "application/vnd.osa.netdeploy": {
    "source": "iana"
  },
  "application/vnd.osgeo.mapguide.package": {
    "source": "iana",
    "extensions": ["mgp"]
  },
  "application/vnd.osgi.bundle": {
    "source": "iana"
  },
  "application/vnd.osgi.dp": {
    "source": "iana",
    "extensions": ["dp"]
  },
  "application/vnd.osgi.subsystem": {
    "source": "iana",
    "extensions": ["esa"]
  },
  "application/vnd.otps.ct-kip+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.oxli.countgraph": {
    "source": "iana"
  },
  "application/vnd.pagerduty+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.palm": {
    "source": "iana",
    "extensions": ["pdb", "pqa", "oprc"]
  },
  "application/vnd.panoply": {
    "source": "iana"
  },
  "application/vnd.paos.xml": {
    "source": "iana"
  },
  "application/vnd.patentdive": {
    "source": "iana"
  },
  "application/vnd.patientecommsdoc": {
    "source": "iana"
  },
  "application/vnd.pawaafile": {
    "source": "iana",
    "extensions": ["paw"]
  },
  "application/vnd.pcos": {
    "source": "iana"
  },
  "application/vnd.pg.format": {
    "source": "iana",
    "extensions": ["str"]
  },
  "application/vnd.pg.osasli": {
    "source": "iana",
    "extensions": ["ei6"]
  },
  "application/vnd.piaccess.application-licence": {
    "source": "iana"
  },
  "application/vnd.picsel": {
    "source": "iana",
    "extensions": ["efif"]
  },
  "application/vnd.pmi.widget": {
    "source": "iana",
    "extensions": ["wg"]
  },
  "application/vnd.poc.group-advertisement+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.pocketlearn": {
    "source": "iana",
    "extensions": ["plf"]
  },
  "application/vnd.powerbuilder6": {
    "source": "iana",
    "extensions": ["pbd"]
  },
  "application/vnd.powerbuilder6-s": {
    "source": "iana"
  },
  "application/vnd.powerbuilder7": {
    "source": "iana"
  },
  "application/vnd.powerbuilder7-s": {
    "source": "iana"
  },
  "application/vnd.powerbuilder75": {
    "source": "iana"
  },
  "application/vnd.powerbuilder75-s": {
    "source": "iana"
  },
  "application/vnd.preminet": {
    "source": "iana"
  },
  "application/vnd.previewsystems.box": {
    "source": "iana",
    "extensions": ["box"]
  },
  "application/vnd.proteus.magazine": {
    "source": "iana",
    "extensions": ["mgz"]
  },
  "application/vnd.psfs": {
    "source": "iana"
  },
  "application/vnd.pt.mundusmundi": {
    "source": "iana"
  },
  "application/vnd.publishare-delta-tree": {
    "source": "iana",
    "extensions": ["qps"]
  },
  "application/vnd.pvi.ptid1": {
    "source": "iana",
    "extensions": ["ptid"]
  },
  "application/vnd.pwg-multiplexed": {
    "source": "iana"
  },
  "application/vnd.pwg-xhtml-print+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["xhtm"]
  },
  "application/vnd.qualcomm.brew-app-res": {
    "source": "iana"
  },
  "application/vnd.quarantainenet": {
    "source": "iana"
  },
  "application/vnd.quark.quarkxpress": {
    "source": "iana",
    "extensions": ["qxd", "qxt", "qwd", "qwt", "qxl", "qxb"]
  },
  "application/vnd.quobject-quoxdocument": {
    "source": "iana"
  },
  "application/vnd.radisys.moml+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.radisys.msml+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.radisys.msml-audit+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.radisys.msml-audit-conf+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.radisys.msml-audit-conn+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.radisys.msml-audit-dialog+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.radisys.msml-audit-stream+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.radisys.msml-conf+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.radisys.msml-dialog+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.radisys.msml-dialog-base+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.radisys.msml-dialog-fax-detect+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.radisys.msml-dialog-fax-sendrecv+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.radisys.msml-dialog-group+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.radisys.msml-dialog-speech+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.radisys.msml-dialog-transform+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.rainstor.data": {
    "source": "iana"
  },
  "application/vnd.rapid": {
    "source": "iana"
  },
  "application/vnd.rar": {
    "source": "iana",
    "extensions": ["rar"]
  },
  "application/vnd.realvnc.bed": {
    "source": "iana",
    "extensions": ["bed"]
  },
  "application/vnd.recordare.musicxml": {
    "source": "iana",
    "extensions": ["mxl"]
  },
  "application/vnd.recordare.musicxml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["musicxml"]
  },
  "application/vnd.relpipe": {
    "source": "iana"
  },
  "application/vnd.renlearn.rlprint": {
    "source": "iana"
  },
  "application/vnd.resilient.logic": {
    "source": "iana"
  },
  "application/vnd.restful+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.rig.cryptonote": {
    "source": "iana",
    "extensions": ["cryptonote"]
  },
  "application/vnd.rim.cod": {
    "source": "apache",
    "extensions": ["cod"]
  },
  "application/vnd.rn-realmedia": {
    "source": "apache",
    "extensions": ["rm"]
  },
  "application/vnd.rn-realmedia-vbr": {
    "source": "apache",
    "extensions": ["rmvb"]
  },
  "application/vnd.route66.link66+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["link66"]
  },
  "application/vnd.rs-274x": {
    "source": "iana"
  },
  "application/vnd.ruckus.download": {
    "source": "iana"
  },
  "application/vnd.s3sms": {
    "source": "iana"
  },
  "application/vnd.sailingtracker.track": {
    "source": "iana",
    "extensions": ["st"]
  },
  "application/vnd.sar": {
    "source": "iana"
  },
  "application/vnd.sbm.cid": {
    "source": "iana"
  },
  "application/vnd.sbm.mid2": {
    "source": "iana"
  },
  "application/vnd.scribus": {
    "source": "iana"
  },
  "application/vnd.sealed.3df": {
    "source": "iana"
  },
  "application/vnd.sealed.csf": {
    "source": "iana"
  },
  "application/vnd.sealed.doc": {
    "source": "iana"
  },
  "application/vnd.sealed.eml": {
    "source": "iana"
  },
  "application/vnd.sealed.mht": {
    "source": "iana"
  },
  "application/vnd.sealed.net": {
    "source": "iana"
  },
  "application/vnd.sealed.ppt": {
    "source": "iana"
  },
  "application/vnd.sealed.tiff": {
    "source": "iana"
  },
  "application/vnd.sealed.xls": {
    "source": "iana"
  },
  "application/vnd.sealedmedia.softseal.html": {
    "source": "iana"
  },
  "application/vnd.sealedmedia.softseal.pdf": {
    "source": "iana"
  },
  "application/vnd.seemail": {
    "source": "iana",
    "extensions": ["see"]
  },
  "application/vnd.seis+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.sema": {
    "source": "iana",
    "extensions": ["sema"]
  },
  "application/vnd.semd": {
    "source": "iana",
    "extensions": ["semd"]
  },
  "application/vnd.semf": {
    "source": "iana",
    "extensions": ["semf"]
  },
  "application/vnd.shade-save-file": {
    "source": "iana"
  },
  "application/vnd.shana.informed.formdata": {
    "source": "iana",
    "extensions": ["ifm"]
  },
  "application/vnd.shana.informed.formtemplate": {
    "source": "iana",
    "extensions": ["itp"]
  },
  "application/vnd.shana.informed.interchange": {
    "source": "iana",
    "extensions": ["iif"]
  },
  "application/vnd.shana.informed.package": {
    "source": "iana",
    "extensions": ["ipk"]
  },
  "application/vnd.shootproof+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.shopkick+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.shp": {
    "source": "iana"
  },
  "application/vnd.shx": {
    "source": "iana"
  },
  "application/vnd.sigrok.session": {
    "source": "iana"
  },
  "application/vnd.simtech-mindmapper": {
    "source": "iana",
    "extensions": ["twd", "twds"]
  },
  "application/vnd.siren+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.smaf": {
    "source": "iana",
    "extensions": ["mmf"]
  },
  "application/vnd.smart.notebook": {
    "source": "iana"
  },
  "application/vnd.smart.teacher": {
    "source": "iana",
    "extensions": ["teacher"]
  },
  "application/vnd.smintio.portals.archive": {
    "source": "iana"
  },
  "application/vnd.snesdev-page-table": {
    "source": "iana"
  },
  "application/vnd.software602.filler.form+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["fo"]
  },
  "application/vnd.software602.filler.form-xml-zip": {
    "source": "iana"
  },
  "application/vnd.solent.sdkm+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["sdkm", "sdkd"]
  },
  "application/vnd.spotfire.dxp": {
    "source": "iana",
    "extensions": ["dxp"]
  },
  "application/vnd.spotfire.sfs": {
    "source": "iana",
    "extensions": ["sfs"]
  },
  "application/vnd.sqlite3": {
    "source": "iana"
  },
  "application/vnd.sss-cod": {
    "source": "iana"
  },
  "application/vnd.sss-dtf": {
    "source": "iana"
  },
  "application/vnd.sss-ntf": {
    "source": "iana"
  },
  "application/vnd.stardivision.calc": {
    "source": "apache",
    "extensions": ["sdc"]
  },
  "application/vnd.stardivision.draw": {
    "source": "apache",
    "extensions": ["sda"]
  },
  "application/vnd.stardivision.impress": {
    "source": "apache",
    "extensions": ["sdd"]
  },
  "application/vnd.stardivision.math": {
    "source": "apache",
    "extensions": ["smf"]
  },
  "application/vnd.stardivision.writer": {
    "source": "apache",
    "extensions": ["sdw", "vor"]
  },
  "application/vnd.stardivision.writer-global": {
    "source": "apache",
    "extensions": ["sgl"]
  },
  "application/vnd.stepmania.package": {
    "source": "iana",
    "extensions": ["smzip"]
  },
  "application/vnd.stepmania.stepchart": {
    "source": "iana",
    "extensions": ["sm"]
  },
  "application/vnd.street-stream": {
    "source": "iana"
  },
  "application/vnd.sun.wadl+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["wadl"]
  },
  "application/vnd.sun.xml.calc": {
    "source": "apache",
    "extensions": ["sxc"]
  },
  "application/vnd.sun.xml.calc.template": {
    "source": "apache",
    "extensions": ["stc"]
  },
  "application/vnd.sun.xml.draw": {
    "source": "apache",
    "extensions": ["sxd"]
  },
  "application/vnd.sun.xml.draw.template": {
    "source": "apache",
    "extensions": ["std"]
  },
  "application/vnd.sun.xml.impress": {
    "source": "apache",
    "extensions": ["sxi"]
  },
  "application/vnd.sun.xml.impress.template": {
    "source": "apache",
    "extensions": ["sti"]
  },
  "application/vnd.sun.xml.math": {
    "source": "apache",
    "extensions": ["sxm"]
  },
  "application/vnd.sun.xml.writer": {
    "source": "apache",
    "extensions": ["sxw"]
  },
  "application/vnd.sun.xml.writer.global": {
    "source": "apache",
    "extensions": ["sxg"]
  },
  "application/vnd.sun.xml.writer.template": {
    "source": "apache",
    "extensions": ["stw"]
  },
  "application/vnd.sus-calendar": {
    "source": "iana",
    "extensions": ["sus", "susp"]
  },
  "application/vnd.svd": {
    "source": "iana",
    "extensions": ["svd"]
  },
  "application/vnd.swiftview-ics": {
    "source": "iana"
  },
  "application/vnd.sybyl.mol2": {
    "source": "iana"
  },
  "application/vnd.sycle+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.syft+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.symbian.install": {
    "source": "apache",
    "extensions": ["sis", "sisx"]
  },
  "application/vnd.syncml+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true,
    "extensions": ["xsm"]
  },
  "application/vnd.syncml.dm+wbxml": {
    "source": "iana",
    "charset": "UTF-8",
    "extensions": ["bdm"]
  },
  "application/vnd.syncml.dm+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true,
    "extensions": ["xdm"]
  },
  "application/vnd.syncml.dm.notification": {
    "source": "iana"
  },
  "application/vnd.syncml.dmddf+wbxml": {
    "source": "iana"
  },
  "application/vnd.syncml.dmddf+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true,
    "extensions": ["ddf"]
  },
  "application/vnd.syncml.dmtnds+wbxml": {
    "source": "iana"
  },
  "application/vnd.syncml.dmtnds+xml": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true
  },
  "application/vnd.syncml.ds.notification": {
    "source": "iana"
  },
  "application/vnd.tableschema+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.tao.intent-module-archive": {
    "source": "iana",
    "extensions": ["tao"]
  },
  "application/vnd.tcpdump.pcap": {
    "source": "iana",
    "extensions": ["pcap", "cap", "dmp"]
  },
  "application/vnd.think-cell.ppttc+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.tmd.mediaflex.api+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.tml": {
    "source": "iana"
  },
  "application/vnd.tmobile-livetv": {
    "source": "iana",
    "extensions": ["tmo"]
  },
  "application/vnd.tri.onesource": {
    "source": "iana"
  },
  "application/vnd.trid.tpt": {
    "source": "iana",
    "extensions": ["tpt"]
  },
  "application/vnd.triscape.mxs": {
    "source": "iana",
    "extensions": ["mxs"]
  },
  "application/vnd.trueapp": {
    "source": "iana",
    "extensions": ["tra"]
  },
  "application/vnd.truedoc": {
    "source": "iana"
  },
  "application/vnd.ubisoft.webplayer": {
    "source": "iana"
  },
  "application/vnd.ufdl": {
    "source": "iana",
    "extensions": ["ufd", "ufdl"]
  },
  "application/vnd.uiq.theme": {
    "source": "iana",
    "extensions": ["utz"]
  },
  "application/vnd.umajin": {
    "source": "iana",
    "extensions": ["umj"]
  },
  "application/vnd.unity": {
    "source": "iana",
    "extensions": ["unityweb"]
  },
  "application/vnd.uoml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["uoml", "uo"]
  },
  "application/vnd.uplanet.alert": {
    "source": "iana"
  },
  "application/vnd.uplanet.alert-wbxml": {
    "source": "iana"
  },
  "application/vnd.uplanet.bearer-choice": {
    "source": "iana"
  },
  "application/vnd.uplanet.bearer-choice-wbxml": {
    "source": "iana"
  },
  "application/vnd.uplanet.cacheop": {
    "source": "iana"
  },
  "application/vnd.uplanet.cacheop-wbxml": {
    "source": "iana"
  },
  "application/vnd.uplanet.channel": {
    "source": "iana"
  },
  "application/vnd.uplanet.channel-wbxml": {
    "source": "iana"
  },
  "application/vnd.uplanet.list": {
    "source": "iana"
  },
  "application/vnd.uplanet.list-wbxml": {
    "source": "iana"
  },
  "application/vnd.uplanet.listcmd": {
    "source": "iana"
  },
  "application/vnd.uplanet.listcmd-wbxml": {
    "source": "iana"
  },
  "application/vnd.uplanet.signal": {
    "source": "iana"
  },
  "application/vnd.uri-map": {
    "source": "iana"
  },
  "application/vnd.valve.source.material": {
    "source": "iana"
  },
  "application/vnd.vcx": {
    "source": "iana",
    "extensions": ["vcx"]
  },
  "application/vnd.vd-study": {
    "source": "iana"
  },
  "application/vnd.vectorworks": {
    "source": "iana"
  },
  "application/vnd.vel+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.verimatrix.vcas": {
    "source": "iana"
  },
  "application/vnd.veritone.aion+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.veryant.thin": {
    "source": "iana"
  },
  "application/vnd.ves.encrypted": {
    "source": "iana"
  },
  "application/vnd.vidsoft.vidconference": {
    "source": "iana"
  },
  "application/vnd.visio": {
    "source": "iana",
    "extensions": ["vsd", "vst", "vss", "vsw"]
  },
  "application/vnd.visionary": {
    "source": "iana",
    "extensions": ["vis"]
  },
  "application/vnd.vividence.scriptfile": {
    "source": "iana"
  },
  "application/vnd.vsf": {
    "source": "iana",
    "extensions": ["vsf"]
  },
  "application/vnd.wap.sic": {
    "source": "iana"
  },
  "application/vnd.wap.slc": {
    "source": "iana"
  },
  "application/vnd.wap.wbxml": {
    "source": "iana",
    "charset": "UTF-8",
    "extensions": ["wbxml"]
  },
  "application/vnd.wap.wmlc": {
    "source": "iana",
    "extensions": ["wmlc"]
  },
  "application/vnd.wap.wmlscriptc": {
    "source": "iana",
    "extensions": ["wmlsc"]
  },
  "application/vnd.wasmflow.wafl": {
    "source": "iana"
  },
  "application/vnd.webturbo": {
    "source": "iana",
    "extensions": ["wtb"]
  },
  "application/vnd.wfa.dpp": {
    "source": "iana"
  },
  "application/vnd.wfa.p2p": {
    "source": "iana"
  },
  "application/vnd.wfa.wsc": {
    "source": "iana"
  },
  "application/vnd.windows.devicepairing": {
    "source": "iana"
  },
  "application/vnd.wmc": {
    "source": "iana"
  },
  "application/vnd.wmf.bootstrap": {
    "source": "iana"
  },
  "application/vnd.wolfram.mathematica": {
    "source": "iana"
  },
  "application/vnd.wolfram.mathematica.package": {
    "source": "iana"
  },
  "application/vnd.wolfram.player": {
    "source": "iana",
    "extensions": ["nbp"]
  },
  "application/vnd.wordlift": {
    "source": "iana"
  },
  "application/vnd.wordperfect": {
    "source": "iana",
    "extensions": ["wpd"]
  },
  "application/vnd.wqd": {
    "source": "iana",
    "extensions": ["wqd"]
  },
  "application/vnd.wrq-hp3000-labelled": {
    "source": "iana"
  },
  "application/vnd.wt.stf": {
    "source": "iana",
    "extensions": ["stf"]
  },
  "application/vnd.wv.csp+wbxml": {
    "source": "iana"
  },
  "application/vnd.wv.csp+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.wv.ssp+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.xacml+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.xara": {
    "source": "iana",
    "extensions": ["xar"]
  },
  "application/vnd.xecrets-encrypted": {
    "source": "iana"
  },
  "application/vnd.xfdl": {
    "source": "iana",
    "extensions": ["xfdl"]
  },
  "application/vnd.xfdl.webform": {
    "source": "iana"
  },
  "application/vnd.xmi+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/vnd.xmpie.cpkg": {
    "source": "iana"
  },
  "application/vnd.xmpie.dpkg": {
    "source": "iana"
  },
  "application/vnd.xmpie.plan": {
    "source": "iana"
  },
  "application/vnd.xmpie.ppkg": {
    "source": "iana"
  },
  "application/vnd.xmpie.xlim": {
    "source": "iana"
  },
  "application/vnd.yamaha.hv-dic": {
    "source": "iana",
    "extensions": ["hvd"]
  },
  "application/vnd.yamaha.hv-script": {
    "source": "iana",
    "extensions": ["hvs"]
  },
  "application/vnd.yamaha.hv-voice": {
    "source": "iana",
    "extensions": ["hvp"]
  },
  "application/vnd.yamaha.openscoreformat": {
    "source": "iana",
    "extensions": ["osf"]
  },
  "application/vnd.yamaha.openscoreformat.osfpvg+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["osfpvg"]
  },
  "application/vnd.yamaha.remote-setup": {
    "source": "iana"
  },
  "application/vnd.yamaha.smaf-audio": {
    "source": "iana",
    "extensions": ["saf"]
  },
  "application/vnd.yamaha.smaf-phrase": {
    "source": "iana",
    "extensions": ["spf"]
  },
  "application/vnd.yamaha.through-ngn": {
    "source": "iana"
  },
  "application/vnd.yamaha.tunnel-udpencap": {
    "source": "iana"
  },
  "application/vnd.yaoweme": {
    "source": "iana"
  },
  "application/vnd.yellowriver-custom-menu": {
    "source": "iana",
    "extensions": ["cmp"]
  },
  "application/vnd.zul": {
    "source": "iana",
    "extensions": ["zir", "zirz"]
  },
  "application/vnd.zzazz.deck+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["zaz"]
  },
  "application/voicexml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["vxml"]
  },
  "application/voucher-cms+json": {
    "source": "iana",
    "compressible": true
  },
  "application/vp": {
    "source": "iana"
  },
  "application/vq-rtcpxr": {
    "source": "iana"
  },
  "application/wasm": {
    "source": "iana",
    "compressible": true,
    "extensions": ["wasm"]
  },
  "application/watcherinfo+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["wif"]
  },
  "application/webpush-options+json": {
    "source": "iana",
    "compressible": true
  },
  "application/whoispp-query": {
    "source": "iana"
  },
  "application/whoispp-response": {
    "source": "iana"
  },
  "application/widget": {
    "source": "iana",
    "extensions": ["wgt"]
  },
  "application/winhlp": {
    "source": "apache",
    "extensions": ["hlp"]
  },
  "application/wita": {
    "source": "iana"
  },
  "application/wordperfect5.1": {
    "source": "iana"
  },
  "application/wsdl+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["wsdl"]
  },
  "application/wspolicy+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["wspolicy"]
  },
  "application/x-7z-compressed": {
    "source": "apache",
    "compressible": false,
    "extensions": ["7z"]
  },
  "application/x-abiword": {
    "source": "apache",
    "extensions": ["abw"]
  },
  "application/x-ace-compressed": {
    "source": "apache",
    "extensions": ["ace"]
  },
  "application/x-amf": {
    "source": "apache"
  },
  "application/x-apple-diskimage": {
    "source": "apache",
    "extensions": ["dmg"]
  },
  "application/x-arj": {
    "compressible": false,
    "extensions": ["arj"]
  },
  "application/x-authorware-bin": {
    "source": "apache",
    "extensions": ["aab", "x32", "u32", "vox"]
  },
  "application/x-authorware-map": {
    "source": "apache",
    "extensions": ["aam"]
  },
  "application/x-authorware-seg": {
    "source": "apache",
    "extensions": ["aas"]
  },
  "application/x-bcpio": {
    "source": "apache",
    "extensions": ["bcpio"]
  },
  "application/x-bdoc": {
    "compressible": false,
    "extensions": ["bdoc"]
  },
  "application/x-bittorrent": {
    "source": "apache",
    "extensions": ["torrent"]
  },
  "application/x-blorb": {
    "source": "apache",
    "extensions": ["blb", "blorb"]
  },
  "application/x-bzip": {
    "source": "apache",
    "compressible": false,
    "extensions": ["bz"]
  },
  "application/x-bzip2": {
    "source": "apache",
    "compressible": false,
    "extensions": ["bz2", "boz"]
  },
  "application/x-cbr": {
    "source": "apache",
    "extensions": ["cbr", "cba", "cbt", "cbz", "cb7"]
  },
  "application/x-cdlink": {
    "source": "apache",
    "extensions": ["vcd"]
  },
  "application/x-cfs-compressed": {
    "source": "apache",
    "extensions": ["cfs"]
  },
  "application/x-chat": {
    "source": "apache",
    "extensions": ["chat"]
  },
  "application/x-chess-pgn": {
    "source": "apache",
    "extensions": ["pgn"]
  },
  "application/x-chrome-extension": {
    "extensions": ["crx"]
  },
  "application/x-cocoa": {
    "source": "nginx",
    "extensions": ["cco"]
  },
  "application/x-compress": {
    "source": "apache"
  },
  "application/x-conference": {
    "source": "apache",
    "extensions": ["nsc"]
  },
  "application/x-cpio": {
    "source": "apache",
    "extensions": ["cpio"]
  },
  "application/x-csh": {
    "source": "apache",
    "extensions": ["csh"]
  },
  "application/x-deb": {
    "compressible": false
  },
  "application/x-debian-package": {
    "source": "apache",
    "extensions": ["deb", "udeb"]
  },
  "application/x-dgc-compressed": {
    "source": "apache",
    "extensions": ["dgc"]
  },
  "application/x-director": {
    "source": "apache",
    "extensions": ["dir", "dcr", "dxr", "cst", "cct", "cxt", "w3d", "fgd", "swa"]
  },
  "application/x-doom": {
    "source": "apache",
    "extensions": ["wad"]
  },
  "application/x-dtbncx+xml": {
    "source": "apache",
    "compressible": true,
    "extensions": ["ncx"]
  },
  "application/x-dtbook+xml": {
    "source": "apache",
    "compressible": true,
    "extensions": ["dtb"]
  },
  "application/x-dtbresource+xml": {
    "source": "apache",
    "compressible": true,
    "extensions": ["res"]
  },
  "application/x-dvi": {
    "source": "apache",
    "compressible": false,
    "extensions": ["dvi"]
  },
  "application/x-envoy": {
    "source": "apache",
    "extensions": ["evy"]
  },
  "application/x-eva": {
    "source": "apache",
    "extensions": ["eva"]
  },
  "application/x-font-bdf": {
    "source": "apache",
    "extensions": ["bdf"]
  },
  "application/x-font-dos": {
    "source": "apache"
  },
  "application/x-font-framemaker": {
    "source": "apache"
  },
  "application/x-font-ghostscript": {
    "source": "apache",
    "extensions": ["gsf"]
  },
  "application/x-font-libgrx": {
    "source": "apache"
  },
  "application/x-font-linux-psf": {
    "source": "apache",
    "extensions": ["psf"]
  },
  "application/x-font-pcf": {
    "source": "apache",
    "extensions": ["pcf"]
  },
  "application/x-font-snf": {
    "source": "apache",
    "extensions": ["snf"]
  },
  "application/x-font-speedo": {
    "source": "apache"
  },
  "application/x-font-sunos-news": {
    "source": "apache"
  },
  "application/x-font-type1": {
    "source": "apache",
    "extensions": ["pfa", "pfb", "pfm", "afm"]
  },
  "application/x-font-vfont": {
    "source": "apache"
  },
  "application/x-freearc": {
    "source": "apache",
    "extensions": ["arc"]
  },
  "application/x-futuresplash": {
    "source": "apache",
    "extensions": ["spl"]
  },
  "application/x-gca-compressed": {
    "source": "apache",
    "extensions": ["gca"]
  },
  "application/x-glulx": {
    "source": "apache",
    "extensions": ["ulx"]
  },
  "application/x-gnumeric": {
    "source": "apache",
    "extensions": ["gnumeric"]
  },
  "application/x-gramps-xml": {
    "source": "apache",
    "extensions": ["gramps"]
  },
  "application/x-gtar": {
    "source": "apache",
    "extensions": ["gtar"]
  },
  "application/x-gzip": {
    "source": "apache"
  },
  "application/x-hdf": {
    "source": "apache",
    "extensions": ["hdf"]
  },
  "application/x-httpd-php": {
    "compressible": true,
    "extensions": ["php"]
  },
  "application/x-install-instructions": {
    "source": "apache",
    "extensions": ["install"]
  },
  "application/x-iso9660-image": {
    "source": "apache",
    "extensions": ["iso"]
  },
  "application/x-iwork-keynote-sffkey": {
    "extensions": ["key"]
  },
  "application/x-iwork-numbers-sffnumbers": {
    "extensions": ["numbers"]
  },
  "application/x-iwork-pages-sffpages": {
    "extensions": ["pages"]
  },
  "application/x-java-archive-diff": {
    "source": "nginx",
    "extensions": ["jardiff"]
  },
  "application/x-java-jnlp-file": {
    "source": "apache",
    "compressible": false,
    "extensions": ["jnlp"]
  },
  "application/x-javascript": {
    "compressible": true
  },
  "application/x-keepass2": {
    "extensions": ["kdbx"]
  },
  "application/x-latex": {
    "source": "apache",
    "compressible": false,
    "extensions": ["latex"]
  },
  "application/x-lua-bytecode": {
    "extensions": ["luac"]
  },
  "application/x-lzh-compressed": {
    "source": "apache",
    "extensions": ["lzh", "lha"]
  },
  "application/x-makeself": {
    "source": "nginx",
    "extensions": ["run"]
  },
  "application/x-mie": {
    "source": "apache",
    "extensions": ["mie"]
  },
  "application/x-mobipocket-ebook": {
    "source": "apache",
    "extensions": ["prc", "mobi"]
  },
  "application/x-mpegurl": {
    "compressible": false
  },
  "application/x-ms-application": {
    "source": "apache",
    "extensions": ["application"]
  },
  "application/x-ms-shortcut": {
    "source": "apache",
    "extensions": ["lnk"]
  },
  "application/x-ms-wmd": {
    "source": "apache",
    "extensions": ["wmd"]
  },
  "application/x-ms-wmz": {
    "source": "apache",
    "extensions": ["wmz"]
  },
  "application/x-ms-xbap": {
    "source": "apache",
    "extensions": ["xbap"]
  },
  "application/x-msaccess": {
    "source": "apache",
    "extensions": ["mdb"]
  },
  "application/x-msbinder": {
    "source": "apache",
    "extensions": ["obd"]
  },
  "application/x-mscardfile": {
    "source": "apache",
    "extensions": ["crd"]
  },
  "application/x-msclip": {
    "source": "apache",
    "extensions": ["clp"]
  },
  "application/x-msdos-program": {
    "extensions": ["exe"]
  },
  "application/x-msdownload": {
    "source": "apache",
    "extensions": ["exe", "dll", "com", "bat", "msi"]
  },
  "application/x-msmediaview": {
    "source": "apache",
    "extensions": ["mvb", "m13", "m14"]
  },
  "application/x-msmetafile": {
    "source": "apache",
    "extensions": ["wmf", "wmz", "emf", "emz"]
  },
  "application/x-msmoney": {
    "source": "apache",
    "extensions": ["mny"]
  },
  "application/x-mspublisher": {
    "source": "apache",
    "extensions": ["pub"]
  },
  "application/x-msschedule": {
    "source": "apache",
    "extensions": ["scd"]
  },
  "application/x-msterminal": {
    "source": "apache",
    "extensions": ["trm"]
  },
  "application/x-mswrite": {
    "source": "apache",
    "extensions": ["wri"]
  },
  "application/x-netcdf": {
    "source": "apache",
    "extensions": ["nc", "cdf"]
  },
  "application/x-ns-proxy-autoconfig": {
    "compressible": true,
    "extensions": ["pac"]
  },
  "application/x-nzb": {
    "source": "apache",
    "extensions": ["nzb"]
  },
  "application/x-perl": {
    "source": "nginx",
    "extensions": ["pl", "pm"]
  },
  "application/x-pilot": {
    "source": "nginx",
    "extensions": ["prc", "pdb"]
  },
  "application/x-pkcs12": {
    "source": "apache",
    "compressible": false,
    "extensions": ["p12", "pfx"]
  },
  "application/x-pkcs7-certificates": {
    "source": "apache",
    "extensions": ["p7b", "spc"]
  },
  "application/x-pkcs7-certreqresp": {
    "source": "apache",
    "extensions": ["p7r"]
  },
  "application/x-pki-message": {
    "source": "iana"
  },
  "application/x-rar-compressed": {
    "source": "apache",
    "compressible": false,
    "extensions": ["rar"]
  },
  "application/x-redhat-package-manager": {
    "source": "nginx",
    "extensions": ["rpm"]
  },
  "application/x-research-info-systems": {
    "source": "apache",
    "extensions": ["ris"]
  },
  "application/x-sea": {
    "source": "nginx",
    "extensions": ["sea"]
  },
  "application/x-sh": {
    "source": "apache",
    "compressible": true,
    "extensions": ["sh"]
  },
  "application/x-shar": {
    "source": "apache",
    "extensions": ["shar"]
  },
  "application/x-shockwave-flash": {
    "source": "apache",
    "compressible": false,
    "extensions": ["swf"]
  },
  "application/x-silverlight-app": {
    "source": "apache",
    "extensions": ["xap"]
  },
  "application/x-sql": {
    "source": "apache",
    "extensions": ["sql"]
  },
  "application/x-stuffit": {
    "source": "apache",
    "compressible": false,
    "extensions": ["sit"]
  },
  "application/x-stuffitx": {
    "source": "apache",
    "extensions": ["sitx"]
  },
  "application/x-subrip": {
    "source": "apache",
    "extensions": ["srt"]
  },
  "application/x-sv4cpio": {
    "source": "apache",
    "extensions": ["sv4cpio"]
  },
  "application/x-sv4crc": {
    "source": "apache",
    "extensions": ["sv4crc"]
  },
  "application/x-t3vm-image": {
    "source": "apache",
    "extensions": ["t3"]
  },
  "application/x-tads": {
    "source": "apache",
    "extensions": ["gam"]
  },
  "application/x-tar": {
    "source": "apache",
    "compressible": true,
    "extensions": ["tar"]
  },
  "application/x-tcl": {
    "source": "apache",
    "extensions": ["tcl", "tk"]
  },
  "application/x-tex": {
    "source": "apache",
    "extensions": ["tex"]
  },
  "application/x-tex-tfm": {
    "source": "apache",
    "extensions": ["tfm"]
  },
  "application/x-texinfo": {
    "source": "apache",
    "extensions": ["texinfo", "texi"]
  },
  "application/x-tgif": {
    "source": "apache",
    "extensions": ["obj"]
  },
  "application/x-ustar": {
    "source": "apache",
    "extensions": ["ustar"]
  },
  "application/x-virtualbox-hdd": {
    "compressible": true,
    "extensions": ["hdd"]
  },
  "application/x-virtualbox-ova": {
    "compressible": true,
    "extensions": ["ova"]
  },
  "application/x-virtualbox-ovf": {
    "compressible": true,
    "extensions": ["ovf"]
  },
  "application/x-virtualbox-vbox": {
    "compressible": true,
    "extensions": ["vbox"]
  },
  "application/x-virtualbox-vbox-extpack": {
    "compressible": false,
    "extensions": ["vbox-extpack"]
  },
  "application/x-virtualbox-vdi": {
    "compressible": true,
    "extensions": ["vdi"]
  },
  "application/x-virtualbox-vhd": {
    "compressible": true,
    "extensions": ["vhd"]
  },
  "application/x-virtualbox-vmdk": {
    "compressible": true,
    "extensions": ["vmdk"]
  },
  "application/x-wais-source": {
    "source": "apache",
    "extensions": ["src"]
  },
  "application/x-web-app-manifest+json": {
    "compressible": true,
    "extensions": ["webapp"]
  },
  "application/x-www-form-urlencoded": {
    "source": "iana",
    "compressible": true
  },
  "application/x-x509-ca-cert": {
    "source": "iana",
    "extensions": ["der", "crt", "pem"]
  },
  "application/x-x509-ca-ra-cert": {
    "source": "iana"
  },
  "application/x-x509-next-ca-cert": {
    "source": "iana"
  },
  "application/x-xfig": {
    "source": "apache",
    "extensions": ["fig"]
  },
  "application/x-xliff+xml": {
    "source": "apache",
    "compressible": true,
    "extensions": ["xlf"]
  },
  "application/x-xpinstall": {
    "source": "apache",
    "compressible": false,
    "extensions": ["xpi"]
  },
  "application/x-xz": {
    "source": "apache",
    "extensions": ["xz"]
  },
  "application/x-zmachine": {
    "source": "apache",
    "extensions": ["z1", "z2", "z3", "z4", "z5", "z6", "z7", "z8"]
  },
  "application/x400-bp": {
    "source": "iana"
  },
  "application/xacml+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/xaml+xml": {
    "source": "apache",
    "compressible": true,
    "extensions": ["xaml"]
  },
  "application/xcap-att+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["xav"]
  },
  "application/xcap-caps+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["xca"]
  },
  "application/xcap-diff+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["xdf"]
  },
  "application/xcap-el+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["xel"]
  },
  "application/xcap-error+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/xcap-ns+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["xns"]
  },
  "application/xcon-conference-info+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/xcon-conference-info-diff+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/xenc+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["xenc"]
  },
  "application/xfdf": {
    "source": "iana",
    "extensions": ["xfdf"]
  },
  "application/xhtml+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["xhtml", "xht"]
  },
  "application/xhtml-voice+xml": {
    "source": "apache",
    "compressible": true
  },
  "application/xliff+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["xlf"]
  },
  "application/xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["xml", "xsl", "xsd", "rng"]
  },
  "application/xml-dtd": {
    "source": "iana",
    "compressible": true,
    "extensions": ["dtd"]
  },
  "application/xml-external-parsed-entity": {
    "source": "iana"
  },
  "application/xml-patch+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/xmpp+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/xop+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["xop"]
  },
  "application/xproc+xml": {
    "source": "apache",
    "compressible": true,
    "extensions": ["xpl"]
  },
  "application/xslt+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["xsl", "xslt"]
  },
  "application/xspf+xml": {
    "source": "apache",
    "compressible": true,
    "extensions": ["xspf"]
  },
  "application/xv+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["mxml", "xhvml", "xvml", "xvm"]
  },
  "application/yaml": {
    "source": "iana"
  },
  "application/yang": {
    "source": "iana",
    "extensions": ["yang"]
  },
  "application/yang-data+cbor": {
    "source": "iana"
  },
  "application/yang-data+json": {
    "source": "iana",
    "compressible": true
  },
  "application/yang-data+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/yang-patch+json": {
    "source": "iana",
    "compressible": true
  },
  "application/yang-patch+xml": {
    "source": "iana",
    "compressible": true
  },
  "application/yang-sid+json": {
    "source": "iana",
    "compressible": true
  },
  "application/yin+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["yin"]
  },
  "application/zip": {
    "source": "iana",
    "compressible": false,
    "extensions": ["zip"]
  },
  "application/zlib": {
    "source": "iana"
  },
  "application/zstd": {
    "source": "iana"
  },
  "audio/1d-interleaved-parityfec": {
    "source": "iana"
  },
  "audio/32kadpcm": {
    "source": "iana"
  },
  "audio/3gpp": {
    "source": "iana",
    "compressible": false,
    "extensions": ["3gpp"]
  },
  "audio/3gpp2": {
    "source": "iana"
  },
  "audio/aac": {
    "source": "iana",
    "extensions": ["adts", "aac"]
  },
  "audio/ac3": {
    "source": "iana"
  },
  "audio/adpcm": {
    "source": "apache",
    "extensions": ["adp"]
  },
  "audio/amr": {
    "source": "iana",
    "extensions": ["amr"]
  },
  "audio/amr-wb": {
    "source": "iana"
  },
  "audio/amr-wb+": {
    "source": "iana"
  },
  "audio/aptx": {
    "source": "iana"
  },
  "audio/asc": {
    "source": "iana"
  },
  "audio/atrac-advanced-lossless": {
    "source": "iana"
  },
  "audio/atrac-x": {
    "source": "iana"
  },
  "audio/atrac3": {
    "source": "iana"
  },
  "audio/basic": {
    "source": "iana",
    "compressible": false,
    "extensions": ["au", "snd"]
  },
  "audio/bv16": {
    "source": "iana"
  },
  "audio/bv32": {
    "source": "iana"
  },
  "audio/clearmode": {
    "source": "iana"
  },
  "audio/cn": {
    "source": "iana"
  },
  "audio/dat12": {
    "source": "iana"
  },
  "audio/dls": {
    "source": "iana"
  },
  "audio/dsr-es201108": {
    "source": "iana"
  },
  "audio/dsr-es202050": {
    "source": "iana"
  },
  "audio/dsr-es202211": {
    "source": "iana"
  },
  "audio/dsr-es202212": {
    "source": "iana"
  },
  "audio/dv": {
    "source": "iana"
  },
  "audio/dvi4": {
    "source": "iana"
  },
  "audio/eac3": {
    "source": "iana"
  },
  "audio/encaprtp": {
    "source": "iana"
  },
  "audio/evrc": {
    "source": "iana"
  },
  "audio/evrc-qcp": {
    "source": "iana"
  },
  "audio/evrc0": {
    "source": "iana"
  },
  "audio/evrc1": {
    "source": "iana"
  },
  "audio/evrcb": {
    "source": "iana"
  },
  "audio/evrcb0": {
    "source": "iana"
  },
  "audio/evrcb1": {
    "source": "iana"
  },
  "audio/evrcnw": {
    "source": "iana"
  },
  "audio/evrcnw0": {
    "source": "iana"
  },
  "audio/evrcnw1": {
    "source": "iana"
  },
  "audio/evrcwb": {
    "source": "iana"
  },
  "audio/evrcwb0": {
    "source": "iana"
  },
  "audio/evrcwb1": {
    "source": "iana"
  },
  "audio/evs": {
    "source": "iana"
  },
  "audio/flac": {
    "source": "iana"
  },
  "audio/flexfec": {
    "source": "iana"
  },
  "audio/fwdred": {
    "source": "iana"
  },
  "audio/g711-0": {
    "source": "iana"
  },
  "audio/g719": {
    "source": "iana"
  },
  "audio/g722": {
    "source": "iana"
  },
  "audio/g7221": {
    "source": "iana"
  },
  "audio/g723": {
    "source": "iana"
  },
  "audio/g726-16": {
    "source": "iana"
  },
  "audio/g726-24": {
    "source": "iana"
  },
  "audio/g726-32": {
    "source": "iana"
  },
  "audio/g726-40": {
    "source": "iana"
  },
  "audio/g728": {
    "source": "iana"
  },
  "audio/g729": {
    "source": "iana"
  },
  "audio/g7291": {
    "source": "iana"
  },
  "audio/g729d": {
    "source": "iana"
  },
  "audio/g729e": {
    "source": "iana"
  },
  "audio/gsm": {
    "source": "iana"
  },
  "audio/gsm-efr": {
    "source": "iana"
  },
  "audio/gsm-hr-08": {
    "source": "iana"
  },
  "audio/ilbc": {
    "source": "iana"
  },
  "audio/ip-mr_v2.5": {
    "source": "iana"
  },
  "audio/isac": {
    "source": "apache"
  },
  "audio/l16": {
    "source": "iana"
  },
  "audio/l20": {
    "source": "iana"
  },
  "audio/l24": {
    "source": "iana",
    "compressible": false
  },
  "audio/l8": {
    "source": "iana"
  },
  "audio/lpc": {
    "source": "iana"
  },
  "audio/matroska": {
    "source": "iana"
  },
  "audio/melp": {
    "source": "iana"
  },
  "audio/melp1200": {
    "source": "iana"
  },
  "audio/melp2400": {
    "source": "iana"
  },
  "audio/melp600": {
    "source": "iana"
  },
  "audio/mhas": {
    "source": "iana"
  },
  "audio/midi": {
    "source": "apache",
    "extensions": ["mid", "midi", "kar", "rmi"]
  },
  "audio/midi-clip": {
    "source": "iana"
  },
  "audio/mobile-xmf": {
    "source": "iana",
    "extensions": ["mxmf"]
  },
  "audio/mp3": {
    "compressible": false,
    "extensions": ["mp3"]
  },
  "audio/mp4": {
    "source": "iana",
    "compressible": false,
    "extensions": ["m4a", "mp4a"]
  },
  "audio/mp4a-latm": {
    "source": "iana"
  },
  "audio/mpa": {
    "source": "iana"
  },
  "audio/mpa-robust": {
    "source": "iana"
  },
  "audio/mpeg": {
    "source": "iana",
    "compressible": false,
    "extensions": ["mpga", "mp2", "mp2a", "mp3", "m2a", "m3a"]
  },
  "audio/mpeg4-generic": {
    "source": "iana"
  },
  "audio/musepack": {
    "source": "apache"
  },
  "audio/ogg": {
    "source": "iana",
    "compressible": false,
    "extensions": ["oga", "ogg", "spx", "opus"]
  },
  "audio/opus": {
    "source": "iana"
  },
  "audio/parityfec": {
    "source": "iana"
  },
  "audio/pcma": {
    "source": "iana"
  },
  "audio/pcma-wb": {
    "source": "iana"
  },
  "audio/pcmu": {
    "source": "iana"
  },
  "audio/pcmu-wb": {
    "source": "iana"
  },
  "audio/prs.sid": {
    "source": "iana"
  },
  "audio/qcelp": {
    "source": "iana"
  },
  "audio/raptorfec": {
    "source": "iana"
  },
  "audio/red": {
    "source": "iana"
  },
  "audio/rtp-enc-aescm128": {
    "source": "iana"
  },
  "audio/rtp-midi": {
    "source": "iana"
  },
  "audio/rtploopback": {
    "source": "iana"
  },
  "audio/rtx": {
    "source": "iana"
  },
  "audio/s3m": {
    "source": "apache",
    "extensions": ["s3m"]
  },
  "audio/scip": {
    "source": "iana"
  },
  "audio/silk": {
    "source": "apache",
    "extensions": ["sil"]
  },
  "audio/smv": {
    "source": "iana"
  },
  "audio/smv-qcp": {
    "source": "iana"
  },
  "audio/smv0": {
    "source": "iana"
  },
  "audio/sofa": {
    "source": "iana"
  },
  "audio/sp-midi": {
    "source": "iana"
  },
  "audio/speex": {
    "source": "iana"
  },
  "audio/t140c": {
    "source": "iana"
  },
  "audio/t38": {
    "source": "iana"
  },
  "audio/telephone-event": {
    "source": "iana"
  },
  "audio/tetra_acelp": {
    "source": "iana"
  },
  "audio/tetra_acelp_bb": {
    "source": "iana"
  },
  "audio/tone": {
    "source": "iana"
  },
  "audio/tsvcis": {
    "source": "iana"
  },
  "audio/uemclip": {
    "source": "iana"
  },
  "audio/ulpfec": {
    "source": "iana"
  },
  "audio/usac": {
    "source": "iana"
  },
  "audio/vdvi": {
    "source": "iana"
  },
  "audio/vmr-wb": {
    "source": "iana"
  },
  "audio/vnd.3gpp.iufp": {
    "source": "iana"
  },
  "audio/vnd.4sb": {
    "source": "iana"
  },
  "audio/vnd.audiokoz": {
    "source": "iana"
  },
  "audio/vnd.celp": {
    "source": "iana"
  },
  "audio/vnd.cisco.nse": {
    "source": "iana"
  },
  "audio/vnd.cmles.radio-events": {
    "source": "iana"
  },
  "audio/vnd.cns.anp1": {
    "source": "iana"
  },
  "audio/vnd.cns.inf1": {
    "source": "iana"
  },
  "audio/vnd.dece.audio": {
    "source": "iana",
    "extensions": ["uva", "uvva"]
  },
  "audio/vnd.digital-winds": {
    "source": "iana",
    "extensions": ["eol"]
  },
  "audio/vnd.dlna.adts": {
    "source": "iana"
  },
  "audio/vnd.dolby.heaac.1": {
    "source": "iana"
  },
  "audio/vnd.dolby.heaac.2": {
    "source": "iana"
  },
  "audio/vnd.dolby.mlp": {
    "source": "iana"
  },
  "audio/vnd.dolby.mps": {
    "source": "iana"
  },
  "audio/vnd.dolby.pl2": {
    "source": "iana"
  },
  "audio/vnd.dolby.pl2x": {
    "source": "iana"
  },
  "audio/vnd.dolby.pl2z": {
    "source": "iana"
  },
  "audio/vnd.dolby.pulse.1": {
    "source": "iana"
  },
  "audio/vnd.dra": {
    "source": "iana",
    "extensions": ["dra"]
  },
  "audio/vnd.dts": {
    "source": "iana",
    "extensions": ["dts"]
  },
  "audio/vnd.dts.hd": {
    "source": "iana",
    "extensions": ["dtshd"]
  },
  "audio/vnd.dts.uhd": {
    "source": "iana"
  },
  "audio/vnd.dvb.file": {
    "source": "iana"
  },
  "audio/vnd.everad.plj": {
    "source": "iana"
  },
  "audio/vnd.hns.audio": {
    "source": "iana"
  },
  "audio/vnd.lucent.voice": {
    "source": "iana",
    "extensions": ["lvp"]
  },
  "audio/vnd.ms-playready.media.pya": {
    "source": "iana",
    "extensions": ["pya"]
  },
  "audio/vnd.nokia.mobile-xmf": {
    "source": "iana"
  },
  "audio/vnd.nortel.vbk": {
    "source": "iana"
  },
  "audio/vnd.nuera.ecelp4800": {
    "source": "iana",
    "extensions": ["ecelp4800"]
  },
  "audio/vnd.nuera.ecelp7470": {
    "source": "iana",
    "extensions": ["ecelp7470"]
  },
  "audio/vnd.nuera.ecelp9600": {
    "source": "iana",
    "extensions": ["ecelp9600"]
  },
  "audio/vnd.octel.sbc": {
    "source": "iana"
  },
  "audio/vnd.presonus.multitrack": {
    "source": "iana"
  },
  "audio/vnd.qcelp": {
    "source": "apache"
  },
  "audio/vnd.rhetorex.32kadpcm": {
    "source": "iana"
  },
  "audio/vnd.rip": {
    "source": "iana",
    "extensions": ["rip"]
  },
  "audio/vnd.rn-realaudio": {
    "compressible": false
  },
  "audio/vnd.sealedmedia.softseal.mpeg": {
    "source": "iana"
  },
  "audio/vnd.vmx.cvsd": {
    "source": "iana"
  },
  "audio/vnd.wave": {
    "compressible": false
  },
  "audio/vorbis": {
    "source": "iana",
    "compressible": false
  },
  "audio/vorbis-config": {
    "source": "iana"
  },
  "audio/wav": {
    "compressible": false,
    "extensions": ["wav"]
  },
  "audio/wave": {
    "compressible": false,
    "extensions": ["wav"]
  },
  "audio/webm": {
    "source": "apache",
    "compressible": false,
    "extensions": ["weba"]
  },
  "audio/x-aac": {
    "source": "apache",
    "compressible": false,
    "extensions": ["aac"]
  },
  "audio/x-aiff": {
    "source": "apache",
    "extensions": ["aif", "aiff", "aifc"]
  },
  "audio/x-caf": {
    "source": "apache",
    "compressible": false,
    "extensions": ["caf"]
  },
  "audio/x-flac": {
    "source": "apache",
    "extensions": ["flac"]
  },
  "audio/x-m4a": {
    "source": "nginx",
    "extensions": ["m4a"]
  },
  "audio/x-matroska": {
    "source": "apache",
    "extensions": ["mka"]
  },
  "audio/x-mpegurl": {
    "source": "apache",
    "extensions": ["m3u"]
  },
  "audio/x-ms-wax": {
    "source": "apache",
    "extensions": ["wax"]
  },
  "audio/x-ms-wma": {
    "source": "apache",
    "extensions": ["wma"]
  },
  "audio/x-pn-realaudio": {
    "source": "apache",
    "extensions": ["ram", "ra"]
  },
  "audio/x-pn-realaudio-plugin": {
    "source": "apache",
    "extensions": ["rmp"]
  },
  "audio/x-realaudio": {
    "source": "nginx",
    "extensions": ["ra"]
  },
  "audio/x-tta": {
    "source": "apache"
  },
  "audio/x-wav": {
    "source": "apache",
    "extensions": ["wav"]
  },
  "audio/xm": {
    "source": "apache",
    "extensions": ["xm"]
  },
  "chemical/x-cdx": {
    "source": "apache",
    "extensions": ["cdx"]
  },
  "chemical/x-cif": {
    "source": "apache",
    "extensions": ["cif"]
  },
  "chemical/x-cmdf": {
    "source": "apache",
    "extensions": ["cmdf"]
  },
  "chemical/x-cml": {
    "source": "apache",
    "extensions": ["cml"]
  },
  "chemical/x-csml": {
    "source": "apache",
    "extensions": ["csml"]
  },
  "chemical/x-pdb": {
    "source": "apache"
  },
  "chemical/x-xyz": {
    "source": "apache",
    "extensions": ["xyz"]
  },
  "font/collection": {
    "source": "iana",
    "extensions": ["ttc"]
  },
  "font/otf": {
    "source": "iana",
    "compressible": true,
    "extensions": ["otf"]
  },
  "font/sfnt": {
    "source": "iana"
  },
  "font/ttf": {
    "source": "iana",
    "compressible": true,
    "extensions": ["ttf"]
  },
  "font/woff": {
    "source": "iana",
    "extensions": ["woff"]
  },
  "font/woff2": {
    "source": "iana",
    "extensions": ["woff2"]
  },
  "image/aces": {
    "source": "iana",
    "extensions": ["exr"]
  },
  "image/apng": {
    "source": "iana",
    "compressible": false,
    "extensions": ["apng"]
  },
  "image/avci": {
    "source": "iana",
    "extensions": ["avci"]
  },
  "image/avcs": {
    "source": "iana",
    "extensions": ["avcs"]
  },
  "image/avif": {
    "source": "iana",
    "compressible": false,
    "extensions": ["avif"]
  },
  "image/bmp": {
    "source": "iana",
    "compressible": true,
    "extensions": ["bmp", "dib"]
  },
  "image/cgm": {
    "source": "iana",
    "extensions": ["cgm"]
  },
  "image/dicom-rle": {
    "source": "iana",
    "extensions": ["drle"]
  },
  "image/dpx": {
    "source": "iana",
    "extensions": ["dpx"]
  },
  "image/emf": {
    "source": "iana",
    "extensions": ["emf"]
  },
  "image/fits": {
    "source": "iana",
    "extensions": ["fits"]
  },
  "image/g3fax": {
    "source": "iana",
    "extensions": ["g3"]
  },
  "image/gif": {
    "source": "iana",
    "compressible": false,
    "extensions": ["gif"]
  },
  "image/heic": {
    "source": "iana",
    "extensions": ["heic"]
  },
  "image/heic-sequence": {
    "source": "iana",
    "extensions": ["heics"]
  },
  "image/heif": {
    "source": "iana",
    "extensions": ["heif"]
  },
  "image/heif-sequence": {
    "source": "iana",
    "extensions": ["heifs"]
  },
  "image/hej2k": {
    "source": "iana",
    "extensions": ["hej2"]
  },
  "image/hsj2": {
    "source": "iana",
    "extensions": ["hsj2"]
  },
  "image/ief": {
    "source": "iana",
    "extensions": ["ief"]
  },
  "image/j2c": {
    "source": "iana"
  },
  "image/jls": {
    "source": "iana",
    "extensions": ["jls"]
  },
  "image/jp2": {
    "source": "iana",
    "compressible": false,
    "extensions": ["jp2", "jpg2"]
  },
  "image/jpeg": {
    "source": "iana",
    "compressible": false,
    "extensions": ["jpeg", "jpg", "jpe"]
  },
  "image/jph": {
    "source": "iana",
    "extensions": ["jph"]
  },
  "image/jphc": {
    "source": "iana",
    "extensions": ["jhc"]
  },
  "image/jpm": {
    "source": "iana",
    "compressible": false,
    "extensions": ["jpm", "jpgm"]
  },
  "image/jpx": {
    "source": "iana",
    "compressible": false,
    "extensions": ["jpx", "jpf"]
  },
  "image/jxl": {
    "source": "iana",
    "extensions": ["jxl"]
  },
  "image/jxr": {
    "source": "iana",
    "extensions": ["jxr"]
  },
  "image/jxra": {
    "source": "iana",
    "extensions": ["jxra"]
  },
  "image/jxrs": {
    "source": "iana",
    "extensions": ["jxrs"]
  },
  "image/jxs": {
    "source": "iana",
    "extensions": ["jxs"]
  },
  "image/jxsc": {
    "source": "iana",
    "extensions": ["jxsc"]
  },
  "image/jxsi": {
    "source": "iana",
    "extensions": ["jxsi"]
  },
  "image/jxss": {
    "source": "iana",
    "extensions": ["jxss"]
  },
  "image/ktx": {
    "source": "iana",
    "extensions": ["ktx"]
  },
  "image/ktx2": {
    "source": "iana",
    "extensions": ["ktx2"]
  },
  "image/naplps": {
    "source": "iana"
  },
  "image/pjpeg": {
    "compressible": false
  },
  "image/png": {
    "source": "iana",
    "compressible": false,
    "extensions": ["png"]
  },
  "image/prs.btif": {
    "source": "iana",
    "extensions": ["btif", "btf"]
  },
  "image/prs.pti": {
    "source": "iana",
    "extensions": ["pti"]
  },
  "image/pwg-raster": {
    "source": "iana"
  },
  "image/sgi": {
    "source": "apache",
    "extensions": ["sgi"]
  },
  "image/svg+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["svg", "svgz"]
  },
  "image/t38": {
    "source": "iana",
    "extensions": ["t38"]
  },
  "image/tiff": {
    "source": "iana",
    "compressible": false,
    "extensions": ["tif", "tiff"]
  },
  "image/tiff-fx": {
    "source": "iana",
    "extensions": ["tfx"]
  },
  "image/vnd.adobe.photoshop": {
    "source": "iana",
    "compressible": true,
    "extensions": ["psd"]
  },
  "image/vnd.airzip.accelerator.azv": {
    "source": "iana",
    "extensions": ["azv"]
  },
  "image/vnd.cns.inf2": {
    "source": "iana"
  },
  "image/vnd.dece.graphic": {
    "source": "iana",
    "extensions": ["uvi", "uvvi", "uvg", "uvvg"]
  },
  "image/vnd.djvu": {
    "source": "iana",
    "extensions": ["djvu", "djv"]
  },
  "image/vnd.dvb.subtitle": {
    "source": "iana",
    "extensions": ["sub"]
  },
  "image/vnd.dwg": {
    "source": "iana",
    "extensions": ["dwg"]
  },
  "image/vnd.dxf": {
    "source": "iana",
    "extensions": ["dxf"]
  },
  "image/vnd.fastbidsheet": {
    "source": "iana",
    "extensions": ["fbs"]
  },
  "image/vnd.fpx": {
    "source": "iana",
    "extensions": ["fpx"]
  },
  "image/vnd.fst": {
    "source": "iana",
    "extensions": ["fst"]
  },
  "image/vnd.fujixerox.edmics-mmr": {
    "source": "iana",
    "extensions": ["mmr"]
  },
  "image/vnd.fujixerox.edmics-rlc": {
    "source": "iana",
    "extensions": ["rlc"]
  },
  "image/vnd.globalgraphics.pgb": {
    "source": "iana"
  },
  "image/vnd.microsoft.icon": {
    "source": "iana",
    "compressible": true,
    "extensions": ["ico"]
  },
  "image/vnd.mix": {
    "source": "iana"
  },
  "image/vnd.mozilla.apng": {
    "source": "iana"
  },
  "image/vnd.ms-dds": {
    "compressible": true,
    "extensions": ["dds"]
  },
  "image/vnd.ms-modi": {
    "source": "iana",
    "extensions": ["mdi"]
  },
  "image/vnd.ms-photo": {
    "source": "apache",
    "extensions": ["wdp"]
  },
  "image/vnd.net-fpx": {
    "source": "iana",
    "extensions": ["npx"]
  },
  "image/vnd.pco.b16": {
    "source": "iana",
    "extensions": ["b16"]
  },
  "image/vnd.radiance": {
    "source": "iana"
  },
  "image/vnd.sealed.png": {
    "source": "iana"
  },
  "image/vnd.sealedmedia.softseal.gif": {
    "source": "iana"
  },
  "image/vnd.sealedmedia.softseal.jpg": {
    "source": "iana"
  },
  "image/vnd.svf": {
    "source": "iana"
  },
  "image/vnd.tencent.tap": {
    "source": "iana",
    "extensions": ["tap"]
  },
  "image/vnd.valve.source.texture": {
    "source": "iana",
    "extensions": ["vtf"]
  },
  "image/vnd.wap.wbmp": {
    "source": "iana",
    "extensions": ["wbmp"]
  },
  "image/vnd.xiff": {
    "source": "iana",
    "extensions": ["xif"]
  },
  "image/vnd.zbrush.pcx": {
    "source": "iana",
    "extensions": ["pcx"]
  },
  "image/webp": {
    "source": "iana",
    "extensions": ["webp"]
  },
  "image/wmf": {
    "source": "iana",
    "extensions": ["wmf"]
  },
  "image/x-3ds": {
    "source": "apache",
    "extensions": ["3ds"]
  },
  "image/x-cmu-raster": {
    "source": "apache",
    "extensions": ["ras"]
  },
  "image/x-cmx": {
    "source": "apache",
    "extensions": ["cmx"]
  },
  "image/x-freehand": {
    "source": "apache",
    "extensions": ["fh", "fhc", "fh4", "fh5", "fh7"]
  },
  "image/x-icon": {
    "source": "apache",
    "compressible": true,
    "extensions": ["ico"]
  },
  "image/x-jng": {
    "source": "nginx",
    "extensions": ["jng"]
  },
  "image/x-mrsid-image": {
    "source": "apache",
    "extensions": ["sid"]
  },
  "image/x-ms-bmp": {
    "source": "nginx",
    "compressible": true,
    "extensions": ["bmp"]
  },
  "image/x-pcx": {
    "source": "apache",
    "extensions": ["pcx"]
  },
  "image/x-pict": {
    "source": "apache",
    "extensions": ["pic", "pct"]
  },
  "image/x-portable-anymap": {
    "source": "apache",
    "extensions": ["pnm"]
  },
  "image/x-portable-bitmap": {
    "source": "apache",
    "extensions": ["pbm"]
  },
  "image/x-portable-graymap": {
    "source": "apache",
    "extensions": ["pgm"]
  },
  "image/x-portable-pixmap": {
    "source": "apache",
    "extensions": ["ppm"]
  },
  "image/x-rgb": {
    "source": "apache",
    "extensions": ["rgb"]
  },
  "image/x-tga": {
    "source": "apache",
    "extensions": ["tga"]
  },
  "image/x-xbitmap": {
    "source": "apache",
    "extensions": ["xbm"]
  },
  "image/x-xcf": {
    "compressible": false
  },
  "image/x-xpixmap": {
    "source": "apache",
    "extensions": ["xpm"]
  },
  "image/x-xwindowdump": {
    "source": "apache",
    "extensions": ["xwd"]
  },
  "message/bhttp": {
    "source": "iana"
  },
  "message/cpim": {
    "source": "iana"
  },
  "message/delivery-status": {
    "source": "iana"
  },
  "message/disposition-notification": {
    "source": "iana",
    "extensions": ["disposition-notification"]
  },
  "message/external-body": {
    "source": "iana"
  },
  "message/feedback-report": {
    "source": "iana"
  },
  "message/global": {
    "source": "iana",
    "extensions": ["u8msg"]
  },
  "message/global-delivery-status": {
    "source": "iana",
    "extensions": ["u8dsn"]
  },
  "message/global-disposition-notification": {
    "source": "iana",
    "extensions": ["u8mdn"]
  },
  "message/global-headers": {
    "source": "iana",
    "extensions": ["u8hdr"]
  },
  "message/http": {
    "source": "iana",
    "compressible": false
  },
  "message/imdn+xml": {
    "source": "iana",
    "compressible": true
  },
  "message/mls": {
    "source": "iana"
  },
  "message/news": {
    "source": "apache"
  },
  "message/ohttp-req": {
    "source": "iana"
  },
  "message/ohttp-res": {
    "source": "iana"
  },
  "message/partial": {
    "source": "iana",
    "compressible": false
  },
  "message/rfc822": {
    "source": "iana",
    "compressible": true,
    "extensions": ["eml", "mime"]
  },
  "message/s-http": {
    "source": "apache"
  },
  "message/sip": {
    "source": "iana"
  },
  "message/sipfrag": {
    "source": "iana"
  },
  "message/tracking-status": {
    "source": "iana"
  },
  "message/vnd.si.simp": {
    "source": "apache"
  },
  "message/vnd.wfa.wsc": {
    "source": "iana",
    "extensions": ["wsc"]
  },
  "model/3mf": {
    "source": "iana",
    "extensions": ["3mf"]
  },
  "model/e57": {
    "source": "iana"
  },
  "model/gltf+json": {
    "source": "iana",
    "compressible": true,
    "extensions": ["gltf"]
  },
  "model/gltf-binary": {
    "source": "iana",
    "compressible": true,
    "extensions": ["glb"]
  },
  "model/iges": {
    "source": "iana",
    "compressible": false,
    "extensions": ["igs", "iges"]
  },
  "model/jt": {
    "source": "iana",
    "extensions": ["jt"]
  },
  "model/mesh": {
    "source": "iana",
    "compressible": false,
    "extensions": ["msh", "mesh", "silo"]
  },
  "model/mtl": {
    "source": "iana",
    "extensions": ["mtl"]
  },
  "model/obj": {
    "source": "iana",
    "extensions": ["obj"]
  },
  "model/prc": {
    "source": "iana",
    "extensions": ["prc"]
  },
  "model/step": {
    "source": "iana"
  },
  "model/step+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["stpx"]
  },
  "model/step+zip": {
    "source": "iana",
    "compressible": false,
    "extensions": ["stpz"]
  },
  "model/step-xml+zip": {
    "source": "iana",
    "compressible": false,
    "extensions": ["stpxz"]
  },
  "model/stl": {
    "source": "iana",
    "extensions": ["stl"]
  },
  "model/u3d": {
    "source": "iana",
    "extensions": ["u3d"]
  },
  "model/vnd.bary": {
    "source": "iana",
    "extensions": ["bary"]
  },
  "model/vnd.cld": {
    "source": "iana",
    "extensions": ["cld"]
  },
  "model/vnd.collada+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["dae"]
  },
  "model/vnd.dwf": {
    "source": "iana",
    "extensions": ["dwf"]
  },
  "model/vnd.flatland.3dml": {
    "source": "iana"
  },
  "model/vnd.gdl": {
    "source": "iana",
    "extensions": ["gdl"]
  },
  "model/vnd.gs-gdl": {
    "source": "apache"
  },
  "model/vnd.gs.gdl": {
    "source": "iana"
  },
  "model/vnd.gtw": {
    "source": "iana",
    "extensions": ["gtw"]
  },
  "model/vnd.moml+xml": {
    "source": "iana",
    "compressible": true
  },
  "model/vnd.mts": {
    "source": "iana",
    "extensions": ["mts"]
  },
  "model/vnd.opengex": {
    "source": "iana",
    "extensions": ["ogex"]
  },
  "model/vnd.parasolid.transmit.binary": {
    "source": "iana",
    "extensions": ["x_b"]
  },
  "model/vnd.parasolid.transmit.text": {
    "source": "iana",
    "extensions": ["x_t"]
  },
  "model/vnd.pytha.pyox": {
    "source": "iana",
    "extensions": ["pyo", "pyox"]
  },
  "model/vnd.rosette.annotated-data-model": {
    "source": "iana"
  },
  "model/vnd.sap.vds": {
    "source": "iana",
    "extensions": ["vds"]
  },
  "model/vnd.usda": {
    "source": "iana",
    "extensions": ["usda"]
  },
  "model/vnd.usdz+zip": {
    "source": "iana",
    "compressible": false,
    "extensions": ["usdz"]
  },
  "model/vnd.valve.source.compiled-map": {
    "source": "iana",
    "extensions": ["bsp"]
  },
  "model/vnd.vtu": {
    "source": "iana",
    "extensions": ["vtu"]
  },
  "model/vrml": {
    "source": "iana",
    "compressible": false,
    "extensions": ["wrl", "vrml"]
  },
  "model/x3d+binary": {
    "source": "apache",
    "compressible": false,
    "extensions": ["x3db", "x3dbz"]
  },
  "model/x3d+fastinfoset": {
    "source": "iana",
    "extensions": ["x3db"]
  },
  "model/x3d+vrml": {
    "source": "apache",
    "compressible": false,
    "extensions": ["x3dv", "x3dvz"]
  },
  "model/x3d+xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["x3d", "x3dz"]
  },
  "model/x3d-vrml": {
    "source": "iana",
    "extensions": ["x3dv"]
  },
  "multipart/alternative": {
    "source": "iana",
    "compressible": false
  },
  "multipart/appledouble": {
    "source": "iana"
  },
  "multipart/byteranges": {
    "source": "iana"
  },
  "multipart/digest": {
    "source": "iana"
  },
  "multipart/encrypted": {
    "source": "iana",
    "compressible": false
  },
  "multipart/form-data": {
    "source": "iana",
    "compressible": false
  },
  "multipart/header-set": {
    "source": "iana"
  },
  "multipart/mixed": {
    "source": "iana"
  },
  "multipart/multilingual": {
    "source": "iana"
  },
  "multipart/parallel": {
    "source": "iana"
  },
  "multipart/related": {
    "source": "iana",
    "compressible": false
  },
  "multipart/report": {
    "source": "iana"
  },
  "multipart/signed": {
    "source": "iana",
    "compressible": false
  },
  "multipart/vnd.bint.med-plus": {
    "source": "iana"
  },
  "multipart/voice-message": {
    "source": "iana"
  },
  "multipart/x-mixed-replace": {
    "source": "iana"
  },
  "text/1d-interleaved-parityfec": {
    "source": "iana"
  },
  "text/cache-manifest": {
    "source": "iana",
    "compressible": true,
    "extensions": ["appcache", "manifest"]
  },
  "text/calendar": {
    "source": "iana",
    "extensions": ["ics", "ifb"]
  },
  "text/calender": {
    "compressible": true
  },
  "text/cmd": {
    "compressible": true
  },
  "text/coffeescript": {
    "extensions": ["coffee", "litcoffee"]
  },
  "text/cql": {
    "source": "iana"
  },
  "text/cql-expression": {
    "source": "iana"
  },
  "text/cql-identifier": {
    "source": "iana"
  },
  "text/css": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true,
    "extensions": ["css"]
  },
  "text/csv": {
    "source": "iana",
    "compressible": true,
    "extensions": ["csv"]
  },
  "text/csv-schema": {
    "source": "iana"
  },
  "text/directory": {
    "source": "iana"
  },
  "text/dns": {
    "source": "iana"
  },
  "text/ecmascript": {
    "source": "apache"
  },
  "text/encaprtp": {
    "source": "iana"
  },
  "text/enriched": {
    "source": "iana"
  },
  "text/fhirpath": {
    "source": "iana"
  },
  "text/flexfec": {
    "source": "iana"
  },
  "text/fwdred": {
    "source": "iana"
  },
  "text/gff3": {
    "source": "iana"
  },
  "text/grammar-ref-list": {
    "source": "iana"
  },
  "text/hl7v2": {
    "source": "iana"
  },
  "text/html": {
    "source": "iana",
    "compressible": true,
    "extensions": ["html", "htm", "shtml"]
  },
  "text/jade": {
    "extensions": ["jade"]
  },
  "text/javascript": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true,
    "extensions": ["js", "mjs"]
  },
  "text/jcr-cnd": {
    "source": "iana"
  },
  "text/jsx": {
    "compressible": true,
    "extensions": ["jsx"]
  },
  "text/less": {
    "compressible": true,
    "extensions": ["less"]
  },
  "text/markdown": {
    "source": "iana",
    "compressible": true,
    "extensions": ["md", "markdown"]
  },
  "text/mathml": {
    "source": "nginx",
    "extensions": ["mml"]
  },
  "text/mdx": {
    "compressible": true,
    "extensions": ["mdx"]
  },
  "text/mizar": {
    "source": "iana"
  },
  "text/n3": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true,
    "extensions": ["n3"]
  },
  "text/parameters": {
    "source": "iana",
    "charset": "UTF-8"
  },
  "text/parityfec": {
    "source": "iana"
  },
  "text/plain": {
    "source": "iana",
    "compressible": true,
    "extensions": ["txt", "text", "conf", "def", "list", "log", "in", "ini"]
  },
  "text/provenance-notation": {
    "source": "iana",
    "charset": "UTF-8"
  },
  "text/prs.fallenstein.rst": {
    "source": "iana"
  },
  "text/prs.lines.tag": {
    "source": "iana",
    "extensions": ["dsc"]
  },
  "text/prs.prop.logic": {
    "source": "iana"
  },
  "text/prs.texi": {
    "source": "iana"
  },
  "text/raptorfec": {
    "source": "iana"
  },
  "text/red": {
    "source": "iana"
  },
  "text/rfc822-headers": {
    "source": "iana"
  },
  "text/richtext": {
    "source": "iana",
    "compressible": true,
    "extensions": ["rtx"]
  },
  "text/rtf": {
    "source": "iana",
    "compressible": true,
    "extensions": ["rtf"]
  },
  "text/rtp-enc-aescm128": {
    "source": "iana"
  },
  "text/rtploopback": {
    "source": "iana"
  },
  "text/rtx": {
    "source": "iana"
  },
  "text/sgml": {
    "source": "iana",
    "extensions": ["sgml", "sgm"]
  },
  "text/shaclc": {
    "source": "iana"
  },
  "text/shex": {
    "source": "iana",
    "extensions": ["shex"]
  },
  "text/slim": {
    "extensions": ["slim", "slm"]
  },
  "text/spdx": {
    "source": "iana",
    "extensions": ["spdx"]
  },
  "text/strings": {
    "source": "iana"
  },
  "text/stylus": {
    "extensions": ["stylus", "styl"]
  },
  "text/t140": {
    "source": "iana"
  },
  "text/tab-separated-values": {
    "source": "iana",
    "compressible": true,
    "extensions": ["tsv"]
  },
  "text/troff": {
    "source": "iana",
    "extensions": ["t", "tr", "roff", "man", "me", "ms"]
  },
  "text/turtle": {
    "source": "iana",
    "charset": "UTF-8",
    "extensions": ["ttl"]
  },
  "text/ulpfec": {
    "source": "iana"
  },
  "text/uri-list": {
    "source": "iana",
    "compressible": true,
    "extensions": ["uri", "uris", "urls"]
  },
  "text/vcard": {
    "source": "iana",
    "compressible": true,
    "extensions": ["vcard"]
  },
  "text/vnd.a": {
    "source": "iana"
  },
  "text/vnd.abc": {
    "source": "iana"
  },
  "text/vnd.ascii-art": {
    "source": "iana"
  },
  "text/vnd.curl": {
    "source": "iana",
    "extensions": ["curl"]
  },
  "text/vnd.curl.dcurl": {
    "source": "apache",
    "extensions": ["dcurl"]
  },
  "text/vnd.curl.mcurl": {
    "source": "apache",
    "extensions": ["mcurl"]
  },
  "text/vnd.curl.scurl": {
    "source": "apache",
    "extensions": ["scurl"]
  },
  "text/vnd.debian.copyright": {
    "source": "iana",
    "charset": "UTF-8"
  },
  "text/vnd.dmclientscript": {
    "source": "iana"
  },
  "text/vnd.dvb.subtitle": {
    "source": "iana",
    "extensions": ["sub"]
  },
  "text/vnd.esmertec.theme-descriptor": {
    "source": "iana",
    "charset": "UTF-8"
  },
  "text/vnd.exchangeable": {
    "source": "iana"
  },
  "text/vnd.familysearch.gedcom": {
    "source": "iana",
    "extensions": ["ged"]
  },
  "text/vnd.ficlab.flt": {
    "source": "iana"
  },
  "text/vnd.fly": {
    "source": "iana",
    "extensions": ["fly"]
  },
  "text/vnd.fmi.flexstor": {
    "source": "iana",
    "extensions": ["flx"]
  },
  "text/vnd.gml": {
    "source": "iana"
  },
  "text/vnd.graphviz": {
    "source": "iana",
    "extensions": ["gv"]
  },
  "text/vnd.hans": {
    "source": "iana"
  },
  "text/vnd.hgl": {
    "source": "iana"
  },
  "text/vnd.in3d.3dml": {
    "source": "iana",
    "extensions": ["3dml"]
  },
  "text/vnd.in3d.spot": {
    "source": "iana",
    "extensions": ["spot"]
  },
  "text/vnd.iptc.newsml": {
    "source": "iana"
  },
  "text/vnd.iptc.nitf": {
    "source": "iana"
  },
  "text/vnd.latex-z": {
    "source": "iana"
  },
  "text/vnd.motorola.reflex": {
    "source": "iana"
  },
  "text/vnd.ms-mediapackage": {
    "source": "iana"
  },
  "text/vnd.net2phone.commcenter.command": {
    "source": "iana"
  },
  "text/vnd.radisys.msml-basic-layout": {
    "source": "iana"
  },
  "text/vnd.senx.warpscript": {
    "source": "iana"
  },
  "text/vnd.si.uricatalogue": {
    "source": "apache"
  },
  "text/vnd.sosi": {
    "source": "iana"
  },
  "text/vnd.sun.j2me.app-descriptor": {
    "source": "iana",
    "charset": "UTF-8",
    "extensions": ["jad"]
  },
  "text/vnd.trolltech.linguist": {
    "source": "iana",
    "charset": "UTF-8"
  },
  "text/vnd.vcf": {
    "source": "iana"
  },
  "text/vnd.wap.si": {
    "source": "iana"
  },
  "text/vnd.wap.sl": {
    "source": "iana"
  },
  "text/vnd.wap.wml": {
    "source": "iana",
    "extensions": ["wml"]
  },
  "text/vnd.wap.wmlscript": {
    "source": "iana",
    "extensions": ["wmls"]
  },
  "text/vnd.zoo.kcl": {
    "source": "iana"
  },
  "text/vtt": {
    "source": "iana",
    "charset": "UTF-8",
    "compressible": true,
    "extensions": ["vtt"]
  },
  "text/wgsl": {
    "source": "iana",
    "extensions": ["wgsl"]
  },
  "text/x-asm": {
    "source": "apache",
    "extensions": ["s", "asm"]
  },
  "text/x-c": {
    "source": "apache",
    "extensions": ["c", "cc", "cxx", "cpp", "h", "hh", "dic"]
  },
  "text/x-component": {
    "source": "nginx",
    "extensions": ["htc"]
  },
  "text/x-fortran": {
    "source": "apache",
    "extensions": ["f", "for", "f77", "f90"]
  },
  "text/x-gwt-rpc": {
    "compressible": true
  },
  "text/x-handlebars-template": {
    "extensions": ["hbs"]
  },
  "text/x-java-source": {
    "source": "apache",
    "extensions": ["java"]
  },
  "text/x-jquery-tmpl": {
    "compressible": true
  },
  "text/x-lua": {
    "extensions": ["lua"]
  },
  "text/x-markdown": {
    "compressible": true,
    "extensions": ["mkd"]
  },
  "text/x-nfo": {
    "source": "apache",
    "extensions": ["nfo"]
  },
  "text/x-opml": {
    "source": "apache",
    "extensions": ["opml"]
  },
  "text/x-org": {
    "compressible": true,
    "extensions": ["org"]
  },
  "text/x-pascal": {
    "source": "apache",
    "extensions": ["p", "pas"]
  },
  "text/x-processing": {
    "compressible": true,
    "extensions": ["pde"]
  },
  "text/x-sass": {
    "extensions": ["sass"]
  },
  "text/x-scss": {
    "extensions": ["scss"]
  },
  "text/x-setext": {
    "source": "apache",
    "extensions": ["etx"]
  },
  "text/x-sfv": {
    "source": "apache",
    "extensions": ["sfv"]
  },
  "text/x-suse-ymp": {
    "compressible": true,
    "extensions": ["ymp"]
  },
  "text/x-uuencode": {
    "source": "apache",
    "extensions": ["uu"]
  },
  "text/x-vcalendar": {
    "source": "apache",
    "extensions": ["vcs"]
  },
  "text/x-vcard": {
    "source": "apache",
    "extensions": ["vcf"]
  },
  "text/xml": {
    "source": "iana",
    "compressible": true,
    "extensions": ["xml"]
  },
  "text/xml-external-parsed-entity": {
    "source": "iana"
  },
  "text/yaml": {
    "compressible": true,
    "extensions": ["yaml", "yml"]
  },
  "video/1d-interleaved-parityfec": {
    "source": "iana"
  },
  "video/3gpp": {
    "source": "iana",
    "extensions": ["3gp", "3gpp"]
  },
  "video/3gpp-tt": {
    "source": "iana"
  },
  "video/3gpp2": {
    "source": "iana",
    "extensions": ["3g2"]
  },
  "video/av1": {
    "source": "iana"
  },
  "video/bmpeg": {
    "source": "iana"
  },
  "video/bt656": {
    "source": "iana"
  },
  "video/celb": {
    "source": "iana"
  },
  "video/dv": {
    "source": "iana"
  },
  "video/encaprtp": {
    "source": "iana"
  },
  "video/evc": {
    "source": "iana"
  },
  "video/ffv1": {
    "source": "iana"
  },
  "video/flexfec": {
    "source": "iana"
  },
  "video/h261": {
    "source": "iana",
    "extensions": ["h261"]
  },
  "video/h263": {
    "source": "iana",
    "extensions": ["h263"]
  },
  "video/h263-1998": {
    "source": "iana"
  },
  "video/h263-2000": {
    "source": "iana"
  },
  "video/h264": {
    "source": "iana",
    "extensions": ["h264"]
  },
  "video/h264-rcdo": {
    "source": "iana"
  },
  "video/h264-svc": {
    "source": "iana"
  },
  "video/h265": {
    "source": "iana"
  },
  "video/h266": {
    "source": "iana"
  },
  "video/iso.segment": {
    "source": "iana",
    "extensions": ["m4s"]
  },
  "video/jpeg": {
    "source": "iana",
    "extensions": ["jpgv"]
  },
  "video/jpeg2000": {
    "source": "iana"
  },
  "video/jpm": {
    "source": "apache",
    "extensions": ["jpm", "jpgm"]
  },
  "video/jxsv": {
    "source": "iana"
  },
  "video/matroska": {
    "source": "iana"
  },
  "video/matroska-3d": {
    "source": "iana"
  },
  "video/mj2": {
    "source": "iana",
    "extensions": ["mj2", "mjp2"]
  },
  "video/mp1s": {
    "source": "iana"
  },
  "video/mp2p": {
    "source": "iana"
  },
  "video/mp2t": {
    "source": "iana",
    "extensions": ["ts", "m2t", "m2ts", "mts"]
  },
  "video/mp4": {
    "source": "iana",
    "compressible": false,
    "extensions": ["mp4", "mp4v", "mpg4"]
  },
  "video/mp4v-es": {
    "source": "iana"
  },
  "video/mpeg": {
    "source": "iana",
    "compressible": false,
    "extensions": ["mpeg", "mpg", "mpe", "m1v", "m2v"]
  },
  "video/mpeg4-generic": {
    "source": "iana"
  },
  "video/mpv": {
    "source": "iana"
  },
  "video/nv": {
    "source": "iana"
  },
  "video/ogg": {
    "source": "iana",
    "compressible": false,
    "extensions": ["ogv"]
  },
  "video/parityfec": {
    "source": "iana"
  },
  "video/pointer": {
    "source": "iana"
  },
  "video/quicktime": {
    "source": "iana",
    "compressible": false,
    "extensions": ["qt", "mov"]
  },
  "video/raptorfec": {
    "source": "iana"
  },
  "video/raw": {
    "source": "iana"
  },
  "video/rtp-enc-aescm128": {
    "source": "iana"
  },
  "video/rtploopback": {
    "source": "iana"
  },
  "video/rtx": {
    "source": "iana"
  },
  "video/scip": {
    "source": "iana"
  },
  "video/smpte291": {
    "source": "iana"
  },
  "video/smpte292m": {
    "source": "iana"
  },
  "video/ulpfec": {
    "source": "iana"
  },
  "video/vc1": {
    "source": "iana"
  },
  "video/vc2": {
    "source": "iana"
  },
  "video/vnd.cctv": {
    "source": "iana"
  },
  "video/vnd.dece.hd": {
    "source": "iana",
    "extensions": ["uvh", "uvvh"]
  },
  "video/vnd.dece.mobile": {
    "source": "iana",
    "extensions": ["uvm", "uvvm"]
  },
  "video/vnd.dece.mp4": {
    "source": "iana"
  },
  "video/vnd.dece.pd": {
    "source": "iana",
    "extensions": ["uvp", "uvvp"]
  },
  "video/vnd.dece.sd": {
    "source": "iana",
    "extensions": ["uvs", "uvvs"]
  },
  "video/vnd.dece.video": {
    "source": "iana",
    "extensions": ["uvv", "uvvv"]
  },
  "video/vnd.directv.mpeg": {
    "source": "iana"
  },
  "video/vnd.directv.mpeg-tts": {
    "source": "iana"
  },
  "video/vnd.dlna.mpeg-tts": {
    "source": "iana"
  },
  "video/vnd.dvb.file": {
    "source": "iana",
    "extensions": ["dvb"]
  },
  "video/vnd.fvt": {
    "source": "iana",
    "extensions": ["fvt"]
  },
  "video/vnd.hns.video": {
    "source": "iana"
  },
  "video/vnd.iptvforum.1dparityfec-1010": {
    "source": "iana"
  },
  "video/vnd.iptvforum.1dparityfec-2005": {
    "source": "iana"
  },
  "video/vnd.iptvforum.2dparityfec-1010": {
    "source": "iana"
  },
  "video/vnd.iptvforum.2dparityfec-2005": {
    "source": "iana"
  },
  "video/vnd.iptvforum.ttsavc": {
    "source": "iana"
  },
  "video/vnd.iptvforum.ttsmpeg2": {
    "source": "iana"
  },
  "video/vnd.motorola.video": {
    "source": "iana"
  },
  "video/vnd.motorola.videop": {
    "source": "iana"
  },
  "video/vnd.mpegurl": {
    "source": "iana",
    "extensions": ["mxu", "m4u"]
  },
  "video/vnd.ms-playready.media.pyv": {
    "source": "iana",
    "extensions": ["pyv"]
  },
  "video/vnd.nokia.interleaved-multimedia": {
    "source": "iana"
  },
  "video/vnd.nokia.mp4vr": {
    "source": "iana"
  },
  "video/vnd.nokia.videovoip": {
    "source": "iana"
  },
  "video/vnd.objectvideo": {
    "source": "iana"
  },
  "video/vnd.radgamettools.bink": {
    "source": "iana"
  },
  "video/vnd.radgamettools.smacker": {
    "source": "apache"
  },
  "video/vnd.sealed.mpeg1": {
    "source": "iana"
  },
  "video/vnd.sealed.mpeg4": {
    "source": "iana"
  },
  "video/vnd.sealed.swf": {
    "source": "iana"
  },
  "video/vnd.sealedmedia.softseal.mov": {
    "source": "iana"
  },
  "video/vnd.uvvu.mp4": {
    "source": "iana",
    "extensions": ["uvu", "uvvu"]
  },
  "video/vnd.vivo": {
    "source": "iana",
    "extensions": ["viv"]
  },
  "video/vnd.youtube.yt": {
    "source": "iana"
  },
  "video/vp8": {
    "source": "iana"
  },
  "video/vp9": {
    "source": "iana"
  },
  "video/webm": {
    "source": "apache",
    "compressible": false,
    "extensions": ["webm"]
  },
  "video/x-f4v": {
    "source": "apache",
    "extensions": ["f4v"]
  },
  "video/x-fli": {
    "source": "apache",
    "extensions": ["fli"]
  },
  "video/x-flv": {
    "source": "apache",
    "compressible": false,
    "extensions": ["flv"]
  },
  "video/x-m4v": {
    "source": "apache",
    "extensions": ["m4v"]
  },
  "video/x-matroska": {
    "source": "apache",
    "compressible": false,
    "extensions": ["mkv", "mk3d", "mks"]
  },
  "video/x-mng": {
    "source": "apache",
    "extensions": ["mng"]
  },
  "video/x-ms-asf": {
    "source": "apache",
    "extensions": ["asf", "asx"]
  },
  "video/x-ms-vob": {
    "source": "apache",
    "extensions": ["vob"]
  },
  "video/x-ms-wm": {
    "source": "apache",
    "extensions": ["wm"]
  },
  "video/x-ms-wmv": {
    "source": "apache",
    "compressible": false,
    "extensions": ["wmv"]
  },
  "video/x-ms-wmx": {
    "source": "apache",
    "extensions": ["wmx"]
  },
  "video/x-ms-wvx": {
    "source": "apache",
    "extensions": ["wvx"]
  },
  "video/x-msvideo": {
    "source": "apache",
    "extensions": ["avi"]
  },
  "video/x-sgi-movie": {
    "source": "apache",
    "extensions": ["movie"]
  },
  "video/x-smv": {
    "source": "apache",
    "extensions": ["smv"]
  },
  "x-conference/x-cooltalk": {
    "source": "apache",
    "extensions": ["ice"]
  },
  "x-shader/x-fragment": {
    "compressible": true
  },
  "x-shader/x-vertex": {
    "compressible": true
  }
};
const types = /* @__PURE__ */ new Map();
const extensions = /* @__PURE__ */ new Map();
const preference = ["nginx", "apache", void 0, "iana"];
for (const type of Object.keys(db)) {
  const mime = db[type];
  const exts = mime.extensions;
  if (!exts || !exts.length) {
    continue;
  }
  extensions.set(type, exts);
  for (const ext of exts) {
    const current = types.get(ext);
    if (current) {
      const from = preference.indexOf(db[current].source);
      const to = preference.indexOf(mime.source);
      if (current !== "application/octet-stream" && current !== "application/mp4" && (from > to || // @ts-ignore work around https://github.com/denoland/dnt/issues/148
      from === to && current.startsWith("application/"))) {
        continue;
      }
    }
    types.set(ext, type);
  }
}
function getCharset(type) {
  try {
    const [mediaType, params] = parseMediaType(type);
    if (params?.charset) {
      return params.charset;
    }
    const entry = db[mediaType];
    if (entry?.charset) {
      return entry.charset;
    }
    if (mediaType.startsWith("text/")) {
      return "UTF-8";
    }
  } catch {
  }
  return void 0;
}
function formatMediaType(type, param) {
  let serializedMediaType = "";
  const [major2 = "", sub] = type.split("/");
  if (!sub) {
    if (!isToken(type)) {
      return "";
    }
    serializedMediaType += type.toLowerCase();
  } else {
    if (!isToken(major2) || !isToken(sub)) {
      return "";
    }
    serializedMediaType += `${major2.toLowerCase()}/${sub.toLowerCase()}`;
  }
  if (param) {
    param = isIterator(param) ? Object.fromEntries(param) : param;
    const attrs = Object.keys(param);
    attrs.sort();
    for (const attribute of attrs) {
      if (!isToken(attribute)) {
        return "";
      }
      const value = param[attribute];
      serializedMediaType += `; ${attribute.toLowerCase()}`;
      const needEnc = needsEncoding(value);
      if (needEnc) {
        serializedMediaType += "*";
      }
      serializedMediaType += "=";
      if (needEnc) {
        serializedMediaType += `utf-8''${encodeURIComponent(value)}`;
        continue;
      }
      if (isToken(value)) {
        serializedMediaType += value;
        continue;
      }
      serializedMediaType += `"${value.replace(/["\\]/gi, (m2) => `\\${m2}`)}"`;
    }
  }
  return serializedMediaType;
}
function typeByExtension(extension) {
  extension = extension.startsWith(".") ? extension.slice(1) : extension;
  return types.get(extension.toLowerCase());
}
function contentType(extensionOrType) {
  try {
    const [mediaType, params = {}] = extensionOrType.includes("/") ? parseMediaType(extensionOrType) : [typeByExtension(extensionOrType), void 0];
    if (!mediaType) {
      return void 0;
    }
    if (!("charset" in params)) {
      const charset = getCharset(mediaType);
      if (charset) {
        params.charset = charset;
      }
    }
    return formatMediaType(mediaType, params);
  } catch {
  }
  return void 0;
}
class ByteSliceStream extends TransformStream {
  #offsetStart = 0;
  #offsetEnd = 0;
  /**
   * Constructs a new instance.
   *
   * @param start The zero-indexed byte index to start reading from.
   * @param end The zero-indexed byte index to stop reading at. Inclusive.
   *
   * @example No parameters
   * ```ts no-assert
   * import { ByteSliceStream } from "@std/streams/byte-slice-stream";
   *
   * const byteSliceStream = new ByteSliceStream();
   * ```
   *
   * @example start = 4, end = 11
   * ```ts no-assert
   * import { ByteSliceStream } from "@std/streams/byte-slice-stream";
   *
   * const byteSliceStream = new ByteSliceStream(4, 11);
   * ```
   */
  constructor(start = 0, end = Infinity) {
    super({
      start: () => {
        if (start < 0) {
          throw new RangeError("`start` must be greater than 0");
        }
        end += 1;
      },
      transform: (chunk, controller) => {
        this.#offsetStart = this.#offsetEnd;
        this.#offsetEnd += chunk.byteLength;
        if (this.#offsetEnd > start) {
          if (this.#offsetStart < start) {
            chunk = chunk.slice(start - this.#offsetStart);
          }
          if (this.#offsetEnd >= end) {
            chunk = chunk.slice(0, chunk.byteLength - this.#offsetEnd + end);
            controller.enqueue(chunk);
            controller.terminate();
          } else {
            controller.enqueue(chunk);
          }
        }
      }
    });
  }
}
function isNumber(x2) {
  if (/^0x[0-9a-f]+$/i.test(String(x2))) return true;
  return /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(String(x2));
}
function setNested(object, keys, value, collect = false) {
  keys.slice(0, -1).forEach((key2) => {
    object[key2] ??= {};
    object = object[key2];
  });
  const key = keys.at(-1);
  if (collect) {
    const v2 = object[key];
    if (Array.isArray(v2)) {
      v2.push(value);
      return;
    }
    value = v2 ? [v2, value] : [value];
  }
  object[key] = value;
}
function hasNested(object, keys) {
  keys = [...keys];
  const lastKey = keys.pop();
  if (!lastKey) return false;
  for (const key of keys) {
    if (!object[key]) return false;
    object = object[key];
  }
  return Object.hasOwn(object, lastKey);
}
function aliasIsBoolean(aliasMap, booleanSet, key) {
  const set = aliasMap.get(key);
  if (set === void 0) return false;
  for (const alias of set) if (booleanSet.has(alias)) return true;
  return false;
}
function isBooleanString(value) {
  return value === "true" || value === "false";
}
function parseBooleanString(value) {
  return value !== "false";
}
const FLAG_REGEXP = /^(?:-(?:(?<doubleDash>-)(?<negated>no-)?)?)(?<key>.+?)(?:=(?<value>.+?))?$/s;
function parseArgs(args, {
  "--": doubleDash = false,
  alias = {},
  boolean = false,
  default: defaults = {},
  stopEarly = false,
  string = [],
  collect = [],
  negatable = [],
  unknown: unknownFn = (i2) => i2
} = {}) {
  const aliasMap = /* @__PURE__ */ new Map();
  const booleanSet = /* @__PURE__ */ new Set();
  const stringSet = /* @__PURE__ */ new Set();
  const collectSet = /* @__PURE__ */ new Set();
  const negatableSet = /* @__PURE__ */ new Set();
  let allBools = false;
  if (alias) {
    for (const key in alias) {
      const val = alias[key];
      if (val === void 0) throw new TypeError("Alias value must be defined");
      const aliases = Array.isArray(val) ? val : [val];
      aliasMap.set(key, new Set(aliases));
      aliases.forEach((alias2) => aliasMap.set(alias2, /* @__PURE__ */ new Set([key, ...aliases.filter((it) => it !== alias2)])));
    }
  }
  if (boolean) {
    if (typeof boolean === "boolean") {
      allBools = boolean;
    } else {
      const booleanArgs = Array.isArray(boolean) ? boolean : [boolean];
      for (const key of booleanArgs.filter(Boolean)) {
        booleanSet.add(key);
        aliasMap.get(key)?.forEach((al) => {
          booleanSet.add(al);
        });
      }
    }
  }
  if (string) {
    const stringArgs = Array.isArray(string) ? string : [string];
    for (const key of stringArgs.filter(Boolean)) {
      stringSet.add(key);
      aliasMap.get(key)?.forEach((al) => stringSet.add(al));
    }
  }
  if (collect) {
    const collectArgs = Array.isArray(collect) ? collect : [collect];
    for (const key of collectArgs.filter(Boolean)) {
      collectSet.add(key);
      aliasMap.get(key)?.forEach((al) => collectSet.add(al));
    }
  }
  if (negatable) {
    const negatableArgs = Array.isArray(negatable) ? negatable : [negatable];
    for (const key of negatableArgs.filter(Boolean)) {
      negatableSet.add(key);
      aliasMap.get(key)?.forEach((alias2) => negatableSet.add(alias2));
    }
  }
  const argv = {
    _: []
  };
  function setArgument(key, value, arg, collect2) {
    if (!booleanSet.has(key) && !stringSet.has(key) && !aliasMap.has(key) && !(allBools && /^--[^=]+$/.test(arg)) && unknownFn?.(arg, key, value) === false) {
      return;
    }
    if (typeof value === "string" && !stringSet.has(key)) {
      value = isNumber(value) ? Number(value) : value;
    }
    const collectable = collect2 && collectSet.has(key);
    setNested(argv, key.split("."), value, collectable);
    aliasMap.get(key)?.forEach((key2) => {
      setNested(argv, key2.split("."), value, collectable);
    });
  }
  let notFlags = [];
  const index = args.indexOf("--");
  if (index !== -1) {
    notFlags = args.slice(index + 1);
    args = args.slice(0, index);
  }
  for (let i2 = 0; i2 < args.length; i2++) {
    const arg = args[i2];
    const groups = arg.match(FLAG_REGEXP)?.groups;
    if (groups) {
      const {
        doubleDash: doubleDash2,
        negated
      } = groups;
      let key = groups.key;
      let value = groups.value;
      if (doubleDash2) {
        if (value) {
          if (booleanSet.has(key)) value = parseBooleanString(value);
          setArgument(key, value, arg, true);
          continue;
        }
        if (negated) {
          if (negatableSet.has(key)) {
            setArgument(key, false, arg, false);
            continue;
          }
          key = `no-${key}`;
        }
        const next = args[i2 + 1];
        if (!booleanSet.has(key) && !allBools && next && !/^-/.test(next) && (aliasMap.get(key) ? !aliasIsBoolean(aliasMap, booleanSet, key) : true)) {
          value = next;
          i2++;
          setArgument(key, value, arg, true);
          continue;
        }
        if (next && isBooleanString(next)) {
          value = parseBooleanString(next);
          i2++;
          setArgument(key, value, arg, true);
          continue;
        }
        value = stringSet.has(key) ? "" : true;
        setArgument(key, value, arg, true);
        continue;
      }
      const letters = arg.slice(1, -1).split("");
      let broken = false;
      for (const [j2, letter] of letters.entries()) {
        const next = arg.slice(j2 + 2);
        if (next === "-") {
          setArgument(letter, next, arg, true);
          continue;
        }
        if (/[A-Za-z]/.test(letter) && /=/.test(next)) {
          setArgument(letter, next.split(/=(.+)/)[1], arg, true);
          broken = true;
          break;
        }
        if (/[A-Za-z]/.test(letter) && /-?\d+(\.\d*)?(e-?\d+)?$/.test(next)) {
          setArgument(letter, next, arg, true);
          broken = true;
          break;
        }
        if (letters[j2 + 1] && letters[j2 + 1].match(/\W/)) {
          setArgument(letter, arg.slice(j2 + 2), arg, true);
          broken = true;
          break;
        }
        setArgument(letter, stringSet.has(letter) ? "" : true, arg, true);
      }
      key = arg.slice(-1);
      if (!broken && key !== "-") {
        const nextArg = args[i2 + 1];
        if (nextArg && !/^(-|--)[^-]/.test(nextArg) && !booleanSet.has(key) && (aliasMap.get(key) ? !aliasIsBoolean(aliasMap, booleanSet, key) : true)) {
          setArgument(key, nextArg, arg, true);
          i2++;
        } else if (nextArg && isBooleanString(nextArg)) {
          const value2 = parseBooleanString(nextArg);
          setArgument(key, value2, arg, true);
          i2++;
        } else {
          setArgument(key, stringSet.has(key) ? "" : true, arg, true);
        }
      }
      continue;
    }
    if (unknownFn?.(arg) !== false) {
      argv._.push(stringSet.has("_") || !isNumber(arg) ? arg : Number(arg));
    }
    if (stopEarly) {
      argv._.push(...args.slice(i2 + 1));
      break;
    }
  }
  for (const [key, value] of Object.entries(defaults)) {
    const keys = key.split(".");
    if (!hasNested(argv, keys)) {
      setNested(argv, keys, value);
      aliasMap.get(key)?.forEach((key2) => setNested(argv, key2.split("."), value));
    }
  }
  for (const key of booleanSet.keys()) {
    const keys = key.split(".");
    if (!hasNested(argv, keys)) {
      const value = collectSet.has(key) ? [] : false;
      setNested(argv, keys, value);
    }
  }
  for (const key of stringSet.keys()) {
    const keys = key.split(".");
    if (!hasNested(argv, keys) && collectSet.has(key)) {
      setNested(argv, keys, []);
    }
  }
  if (doubleDash) {
    argv["--"] = [];
    for (const key of notFlags) {
      argv["--"].push(key);
    }
  } else {
    for (const key of notFlags) {
      argv._.push(key);
    }
  }
  return argv;
}
const {
  Deno: Deno$1
} = globalThis;
const noColor = typeof Deno$1?.noColor === "boolean" ? Deno$1.noColor : false;
let enabled = !noColor;
function code(open, close) {
  return {
    open: `\x1B[${open.join(";")}m`,
    close: `\x1B[${close}m`,
    regexp: new RegExp(`\\x1b\\[${close}m`, "g")
  };
}
function run(str, code2) {
  return enabled ? `${code2.open}${str.replace(code2.regexp, code2.open)}${code2.close}` : str;
}
function red(str) {
  return run(str, code([31], 39));
}
const version = "0.224.5";
const denoConfig = {
  version
};
function format(num, options2 = {}) {
  if (!Number.isFinite(num)) {
    throw new TypeError(`Expected a finite number, got ${typeof num}: ${num}`);
  }
  const UNITS_FIRSTLETTER = (options2.bits ? "b" : "B") + "kMGTPEZY";
  if (options2.signed && num === 0) {
    return ` 0 ${UNITS_FIRSTLETTER[0]}`;
  }
  const prefix = num < 0 ? "-" : options2.signed ? "+" : "";
  num = Math.abs(num);
  const localeOptions = getLocaleOptions(options2);
  if (num < 1) {
    const numberString2 = toLocaleString(num, options2.locale, localeOptions);
    return prefix + numberString2 + " " + UNITS_FIRSTLETTER[0];
  }
  const exponent = Math.min(Math.floor(options2.binary ? Math.log(num) / Math.log(1024) : Math.log10(num) / 3), UNITS_FIRSTLETTER.length - 1);
  num /= Math.pow(options2.binary ? 1024 : 1e3, exponent);
  if (!localeOptions) {
    num = Number(num.toPrecision(3));
  }
  const numberString = toLocaleString(num, options2.locale, localeOptions);
  let unit = UNITS_FIRSTLETTER[exponent];
  if (exponent > 0) {
    unit += options2.binary ? "i" : "";
    unit += options2.bits ? "bit" : "B";
  }
  return prefix + numberString + " " + unit;
}
function getLocaleOptions({
  maximumFractionDigits,
  minimumFractionDigits
}) {
  if (maximumFractionDigits || minimumFractionDigits) {
    return {
      maximumFractionDigits,
      minimumFractionDigits
    };
  }
}
function toLocaleString(num, locale, options2) {
  if (typeof locale === "string" || Array.isArray(locale)) {
    return num.toLocaleString(locale, options2);
  } else if (locale === true || options2 !== void 0) {
    return num.toLocaleString(void 0, options2);
  }
  return num.toString();
}
function getNetworkAddress(family = "IPv4") {
  return Deno.networkInterfaces().find((i2) => i2.family === family && (family === "IPv4" ? !i2.address.startsWith("127") : !(i2.address === "::1" || i2.address === "fe80::1") && i2.scopeid === 0))?.address;
}
const ENV_PERM_STATUS = Deno.permissions.querySync?.({
  name: "env",
  variable: "DENO_DEPLOYMENT_ID"
}).state ?? "granted";
const DENO_DEPLOYMENT_ID = ENV_PERM_STATUS === "granted" ? Deno.env.get("DENO_DEPLOYMENT_ID") : void 0;
const HASHED_DENO_DEPLOYMENT_ID = DENO_DEPLOYMENT_ID ? calculate(DENO_DEPLOYMENT_ID, {
  weak: true
}) : void 0;
function modeToString(isDir, maybeMode) {
  const modeMap = ["---", "--x", "-w-", "-wx", "r--", "r-x", "rw-", "rwx"];
  if (maybeMode === null) {
    return "(unknown mode)";
  }
  const mode = maybeMode.toString(8);
  if (mode.length < 3) {
    return "(unknown mode)";
  }
  let output = "";
  mode.split("").reverse().slice(0, 3).forEach((v2) => {
    output = `${modeMap[+v2]} ${output}`;
  });
  output = `${isDir ? "d" : "-"} ${output}`;
  return output;
}
function createStandardResponse(status, init) {
  const statusText = STATUS_TEXT[status];
  return new Response(statusText, {
    status,
    statusText,
    ...init
  });
}
function parseRangeHeader(rangeValue, fileSize) {
  const rangeRegex = /bytes=(?<start>\d+)?-(?<end>\d+)?$/u;
  const parsed = rangeValue.match(rangeRegex);
  if (!parsed || !parsed.groups) {
    return null;
  }
  const {
    start,
    end
  } = parsed.groups;
  if (start !== void 0) {
    if (end !== void 0) {
      return {
        start: +start,
        end: +end
      };
    } else {
      return {
        start: +start,
        end: fileSize - 1
      };
    }
  } else {
    if (end !== void 0) {
      return {
        start: fileSize - +end,
        end: fileSize - 1
      };
    } else {
      return null;
    }
  }
}
async function serveFile(req, filePath, {
  etagAlgorithm: algorithm,
  fileInfo
} = {}) {
  try {
    fileInfo ??= await Deno.stat(filePath);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      await req.body?.cancel();
      return createStandardResponse(STATUS_CODE.NotFound);
    } else {
      throw error;
    }
  }
  if (fileInfo.isDirectory) {
    await req.body?.cancel();
    return createStandardResponse(STATUS_CODE.NotFound);
  }
  const headers = createBaseHeaders();
  if (fileInfo.atime) {
    headers.set("date", fileInfo.atime.toUTCString());
  }
  const etag = fileInfo.mtime ? await calculate(fileInfo, {
    algorithm
  }) : await HASHED_DENO_DEPLOYMENT_ID;
  if (fileInfo.mtime) {
    headers.set("last-modified", fileInfo.mtime.toUTCString());
  }
  if (etag) {
    headers.set("etag", etag);
  }
  if (etag || fileInfo.mtime) {
    const ifNoneMatchValue = req.headers.get("if-none-match");
    const ifModifiedSinceValue = req.headers.get("if-modified-since");
    if (!ifNoneMatch(ifNoneMatchValue, etag) || ifNoneMatchValue === null && fileInfo.mtime && ifModifiedSinceValue && fileInfo.mtime.getTime() < new Date(ifModifiedSinceValue).getTime() + 1e3) {
      const status2 = STATUS_CODE.NotModified;
      return new Response(null, {
        status: status2,
        statusText: STATUS_TEXT[status2],
        headers
      });
    }
  }
  const contentTypeValue = contentType(extname(filePath));
  if (contentTypeValue) {
    headers.set("content-type", contentTypeValue);
  }
  const fileSize = fileInfo.size;
  const rangeValue = req.headers.get("range");
  if (rangeValue && 0 < fileSize) {
    const parsed = parseRangeHeader(rangeValue, fileSize);
    if (!parsed) {
      headers.set("content-length", `${fileSize}`);
      const file3 = await Deno.open(filePath);
      const status3 = STATUS_CODE.OK;
      return new Response(file3.readable, {
        status: status3,
        statusText: STATUS_TEXT[status3],
        headers
      });
    }
    if (parsed.end < 0 || parsed.end < parsed.start || fileSize <= parsed.start) {
      headers.set("content-range", `bytes */${fileSize}`);
      return createStandardResponse(STATUS_CODE.RangeNotSatisfiable, {
        headers
      });
    }
    const start = Math.max(0, parsed.start);
    const end = Math.min(parsed.end, fileSize - 1);
    headers.set("content-range", `bytes ${start}-${end}/${fileSize}`);
    const contentLength = end - start + 1;
    headers.set("content-length", `${contentLength}`);
    const file2 = await Deno.open(filePath);
    await file2.seek(start, Deno.SeekMode.Start);
    const sliced = file2.readable.pipeThrough(new ByteSliceStream(0, contentLength - 1));
    const status2 = STATUS_CODE.PartialContent;
    return new Response(sliced, {
      status: status2,
      statusText: STATUS_TEXT[status2],
      headers
    });
  }
  headers.set("content-length", `${fileSize}`);
  const file = await Deno.open(filePath);
  const status = STATUS_CODE.OK;
  return new Response(file.readable, {
    status,
    statusText: STATUS_TEXT[status],
    headers
  });
}
async function serveDirIndex(dirPath, options2) {
  const {
    showDotfiles
  } = options2;
  const urlRoot = options2.urlRoot ? "/" + options2.urlRoot : "";
  const dirUrl = `/${relative(options2.target, dirPath).replaceAll(new RegExp(SEPARATOR_PATTERN, "g"), "/")}`;
  const listEntryPromise = [];
  if (dirUrl !== "/") {
    const prevPath = join(dirPath, "..");
    const entryInfo = Deno.stat(prevPath).then((fileInfo) => ({
      mode: modeToString(true, fileInfo.mode),
      size: "",
      name: "../",
      url: `${urlRoot}${join$2(dirUrl, "..")}`
    }));
    listEntryPromise.push(entryInfo);
  }
  for await (const entry of Deno.readDir(dirPath)) {
    if (!showDotfiles && entry.name[0] === ".") {
      continue;
    }
    const filePath = join(dirPath, entry.name);
    const fileUrl = encodeURIComponent(join$2(dirUrl, entry.name)).replaceAll("%2F", "/");
    listEntryPromise.push((async () => {
      try {
        const fileInfo = await Deno.stat(filePath);
        return {
          mode: modeToString(entry.isDirectory, fileInfo.mode),
          size: entry.isFile ? format(fileInfo.size ?? 0) : "",
          name: `${entry.name}${entry.isDirectory ? "/" : ""}`,
          url: `${urlRoot}${fileUrl}${entry.isDirectory ? "/" : ""}`
        };
      } catch (error) {
        if (!options2.quiet) logError(error);
        return {
          mode: "(unknown mode)",
          size: "",
          name: `${entry.name}${entry.isDirectory ? "/" : ""}`,
          url: `${urlRoot}${fileUrl}${entry.isDirectory ? "/" : ""}`
        };
      }
    })());
  }
  const listEntry = await Promise.all(listEntryPromise);
  listEntry.sort((a2, b2) => a2.name.toLowerCase() > b2.name.toLowerCase() ? 1 : -1);
  const formattedDirUrl = `${dirUrl.replace(/\/$/, "")}/`;
  const page = dirViewerTemplate(formattedDirUrl, listEntry);
  const headers = createBaseHeaders();
  headers.set("content-type", "text/html; charset=UTF-8");
  const status = STATUS_CODE.OK;
  return new Response(page, {
    status,
    statusText: STATUS_TEXT[status],
    headers
  });
}
function serveFallback(maybeError) {
  if (maybeError instanceof URIError) {
    return createStandardResponse(STATUS_CODE.BadRequest);
  }
  if (maybeError instanceof Deno.errors.NotFound) {
    return createStandardResponse(STATUS_CODE.NotFound);
  }
  return createStandardResponse(STATUS_CODE.InternalServerError);
}
function serverLog(req, status) {
  const d2 = (/* @__PURE__ */ new Date()).toISOString();
  const dateFmt = `[${d2.slice(0, 10)} ${d2.slice(11, 19)}]`;
  const url = new URL(req.url);
  const s2 = `${dateFmt} [${req.method}] ${url.pathname}${url.search} ${status}`;
  console.debug(s2);
}
function createBaseHeaders() {
  return new Headers({
    server: "deno",
    // Set "accept-ranges" so that the client knows it can make range requests on future requests
    "accept-ranges": "bytes"
  });
}
function dirViewerTemplate(dirname, entries) {
  const paths = dirname.split("/");
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="ie=edge" />
        <title>Deno File Server</title>
        <style>
          :root {
            --background-color: #fafafa;
            --color: rgba(0, 0, 0, 0.87);
          }
          @media (prefers-color-scheme: dark) {
            :root {
              --background-color: #292929;
              --color: #fff;
            }
            thead {
              color: #7f7f7f;
            }
          }
          @media (min-width: 960px) {
            main {
              max-width: 960px;
            }
            body {
              padding-left: 32px;
              padding-right: 32px;
            }
          }
          @media (min-width: 600px) {
            main {
              padding-left: 24px;
              padding-right: 24px;
            }
          }
          body {
            background: var(--background-color);
            color: var(--color);
            font-family: "Roboto", "Helvetica", "Arial", sans-serif;
            font-weight: 400;
            line-height: 1.43;
            font-size: 0.875rem;
          }
          a {
            color: #2196f3;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
          thead {
            text-align: left;
          }
          thead th {
            padding-bottom: 12px;
          }
          table td {
            padding: 6px 36px 6px 0px;
          }
          .size {
            text-align: right;
            padding: 6px 12px 6px 24px;
          }
          .mode {
            font-family: monospace, monospace;
          }
        </style>
      </head>
      <body>
        <main>
          <h1>Index of
          <a href="/">home</a>${paths.map((path, index, array) => {
    if (path === "") return "";
    const link = array.slice(0, index + 1).join("/");
    return `<a href="${link}">${path}</a>`;
  }).join("/")}
          </h1>
          <table>
            <thead>
              <tr>
                <th>Mode</th>
                <th>Size</th>
                <th>Name</th>
              </tr>
            </thead>
            ${entries.map((entry) => `
                  <tr>
                    <td class="mode">
                      ${entry.mode}
                    </td>
                    <td class="size">
                      ${entry.size}
                    </td>
                    <td>
                      <a href="${entry.url}">${entry.name}</a>
                    </td>
                  </tr>
                `).join("")}
          </table>
        </main>
      </body>
    </html>
  `;
}
async function serveDir(req, opts = {}) {
  let response;
  try {
    response = await createServeDirResponse(req, opts);
  } catch (error) {
    if (!opts.quiet) logError(error);
    response = serveFallback(error);
  }
  const isRedirectResponse = isRedirectStatus(response.status);
  if (opts.enableCors && !isRedirectResponse) {
    response.headers.append("access-control-allow-origin", "*");
    response.headers.append("access-control-allow-headers", "Origin, X-Requested-With, Content-Type, Accept, Range");
  }
  if (!opts.quiet) serverLog(req, response.status);
  if (opts.headers && !isRedirectResponse) {
    for (const header of opts.headers) {
      const headerSplit = header.split(":");
      const name = headerSplit[0];
      const value = headerSplit.slice(1).join(":");
      response.headers.append(name, value);
    }
  }
  return response;
}
async function createServeDirResponse(req, opts) {
  const target = opts.fsRoot || ".";
  const urlRoot = opts.urlRoot;
  const showIndex = opts.showIndex ?? true;
  const showDotfiles = opts.showDotfiles || false;
  const {
    etagAlgorithm,
    showDirListing,
    quiet
  } = opts;
  const url = new URL(req.url);
  const decodedUrl = decodeURIComponent(url.pathname);
  let normalizedPath = normalize$1(decodedUrl);
  if (urlRoot && !normalizedPath.startsWith("/" + urlRoot)) {
    return createStandardResponse(STATUS_CODE.NotFound);
  }
  if (normalizedPath !== decodedUrl) {
    url.pathname = normalizedPath;
    return Response.redirect(url, 301);
  }
  if (urlRoot) {
    normalizedPath = normalizedPath.replace(urlRoot, "");
  }
  if (normalizedPath.endsWith("/")) {
    normalizedPath = normalizedPath.slice(0, -1);
  }
  const fsPath = join(target, normalizedPath);
  const fileInfo = await Deno.stat(fsPath);
  if (fileInfo.isFile && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.slice(0, -1);
    return Response.redirect(url, 301);
  }
  if (fileInfo.isDirectory && !url.pathname.endsWith("/")) {
    url.pathname += "/";
    return Response.redirect(url, 301);
  }
  if (!fileInfo.isDirectory) {
    return serveFile(req, fsPath, {
      etagAlgorithm,
      fileInfo
    });
  }
  if (showIndex) {
    const indexPath2 = join(fsPath, "index.html");
    let indexFileInfo;
    try {
      indexFileInfo = await Deno.lstat(indexPath2);
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) {
        throw error;
      }
    }
    if (indexFileInfo?.isFile) {
      return serveFile(req, indexPath2, {
        etagAlgorithm,
        fileInfo: indexFileInfo
      });
    }
  }
  if (showDirListing) {
    return serveDirIndex(fsPath, {
      urlRoot,
      showDotfiles,
      target,
      quiet
    });
  }
  return createStandardResponse(STATUS_CODE.NotFound);
}
function logError(error) {
  console.error(red(error instanceof Error ? error.message : `${error}`));
}
function main() {
  const serverArgs = parseArgs(Deno.args, {
    string: ["port", "host", "cert", "key", "header"],
    boolean: ["help", "dir-listing", "dotfiles", "cors", "verbose", "version"],
    negatable: ["dir-listing", "dotfiles", "cors"],
    collect: ["header"],
    default: {
      "dir-listing": true,
      dotfiles: true,
      cors: true,
      verbose: false,
      version: false,
      host: "0.0.0.0",
      port: "4507",
      cert: "",
      key: ""
    },
    alias: {
      p: "port",
      c: "cert",
      k: "key",
      h: "help",
      v: "verbose",
      V: "version",
      H: "header"
    }
  });
  const port = Number(serverArgs.port);
  const headers = serverArgs.header || [];
  const host = serverArgs.host;
  const certFile = serverArgs.cert;
  const keyFile = serverArgs.key;
  if (serverArgs.help) {
    printUsage();
    Deno.exit();
  }
  if (serverArgs.version) {
    console.log(`Deno File Server ${denoConfig.version}`);
    Deno.exit();
  }
  if (keyFile || certFile) {
    if (keyFile === "" || certFile === "") {
      console.log("--key and --cert are required for TLS");
      printUsage();
      Deno.exit(1);
    }
  }
  const wild = serverArgs._;
  const target = resolve(wild[0] ?? "");
  const handler2 = (req) => {
    return serveDir(req, {
      fsRoot: target,
      showDirListing: serverArgs["dir-listing"],
      showDotfiles: serverArgs.dotfiles,
      enableCors: serverArgs.cors,
      quiet: !serverArgs.verbose,
      headers
    });
  };
  const useTls = !!(keyFile && certFile);
  function onListen({
    port: port2,
    hostname
  }) {
    const networkAddress = getNetworkAddress();
    const protocol = useTls ? "https" : "http";
    let message = `Listening on:
- Local: ${protocol}://${hostname}:${port2}`;
    if (networkAddress && !DENO_DEPLOYMENT_ID) {
      message += `
- Network: ${protocol}://${networkAddress}:${port2}`;
    }
    console.log(message);
  }
  if (useTls) {
    Deno.serve({
      port,
      hostname: host,
      onListen,
      cert: Deno.readTextFileSync(certFile),
      key: Deno.readTextFileSync(keyFile)
    }, handler2);
  } else {
    Deno.serve({
      port,
      hostname: host,
      onListen
    }, handler2);
  }
}
function printUsage() {
  console.log(`Deno File Server ${denoConfig.version}
  Serves a local directory in HTTP.

INSTALL:
  deno install --allow-net --allow-read jsr:@std/http@${denoConfig.version}/file_server

USAGE:
  file_server [path] [options]

OPTIONS:
  -h, --help            Prints help information
  -p, --port <PORT>     Set port
  --cors                Enable CORS via the "Access-Control-Allow-Origin" header
  --host     <HOST>     Hostname (default is 0.0.0.0)
  -c, --cert <FILE>     TLS certificate file (enables TLS)
  -k, --key  <FILE>     TLS key file (enables TLS)
  -H, --header <HEADER> Sets a header on every request.
                        (e.g. --header "Cache-Control: no-cache")
                        This option can be specified multiple times.
  --no-dir-listing      Disable directory listing
  --no-dotfiles         Do not show dotfiles
  --no-cors             Disable cross-origin resource sharing
  -v, --verbose         Print request level logs
  -V, --version         Print version information

  All TLS options are required when one is provided.`);
}
if (import.meta.main) {
  main();
}
const GA4_ENDPOINT_URL = "https://www.google-analytics.com/g/collect";
const SLOW_UPLOAD_THRESHOLD = 1e3;
class GA4Report {
  constructor({
    measurementId,
    request,
    response,
    conn
  }) {
    this.measurementId = measurementId;
    this.client = {
      id: getClientId(request),
      ip: getClientIp(request, conn),
      language: getClientLanguage(request),
      headers: getClientHeaders(request)
    };
    this.user = {
      properties: {}
    };
    this.session = getSession(conn);
    this.page = {
      location: request.url,
      title: getPageTitle(request, response),
      referrer: getPageReferrer(request),
      // trafficType: getPageTrafficType(request),
      firstVisit: getFirstVisit(request)
    };
    this.campaign = getCampaignObject(request);
    this.events = [{
      name: "page_view",
      params: {}
    }];
  }
  get event() {
    return this.events[0];
  }
  set event(event) {
    this.events[0] = event;
  }
  async send() {
    if (!this.events.find(Boolean)) {
      return;
    }
    this.measurementId ??= Deno.env.get("GA4_MEASUREMENT_ID");
    if (!this.measurementId) {
      return this.warn("GA4_MEASUREMENT_ID environment variable not set. Google Analytics reporting disabled.");
    }
    if (this.client.id == null) {
      if (this.client.ip == null) {
        return this.warn("either `client.id` or `client.ip` must be set.");
      }
      const material = [this.client.ip, this.client.headers.get("user-agent"), this.client.headers.get("sec-ch-ua")].join();
      this.client.id = await toDigest(material);
    }
    const queryParams = {};
    addShortParam(queryParams, "v", 2);
    addShortParam(queryParams, "tid", this.measurementId);
    addShortParam(queryParams, "cid", this.client.id);
    addShortParam(queryParams, "ul", this.client.language);
    addShortParam(queryParams, "_uip", this.client.ip);
    addShortParam(queryParams, "uid", this.user.id);
    for (const [name, value] of Object.entries(this.user.properties)) {
      addCustomParam(queryParams, "up", name, value);
    }
    addShortParam(queryParams, "cs", this.campaign?.source);
    addShortParam(queryParams, "cm", this.campaign?.medium);
    addShortParam(queryParams, "ci", this.campaign?.id);
    addShortParam(queryParams, "cn", this.campaign?.name);
    addShortParam(queryParams, "cc", this.campaign?.content);
    addShortParam(queryParams, "ck", this.campaign?.term);
    addShortParam(queryParams, "sid", this.session?.id);
    addShortParam(queryParams, "sct", this.session?.number);
    addShortParam(queryParams, "seg", this.session?.engaged);
    addShortParam(queryParams, "_s", this.session?.hitCount);
    addShortParam(queryParams, "dl", this.page.location);
    addShortParam(queryParams, "dr", this.page.referrer);
    addShortParam(queryParams, "dt", this.page.title);
    addShortParam(queryParams, "ir", this.page.ignoreReferrer, false);
    if (this.event != null) {
      addEventParams(queryParams, this.event);
      addShortParam(queryParams, "en", this.event.name);
      addShortParam(queryParams, "_fv", this.page.firstVisit, false);
      addShortParam(queryParams, "_nts", this.page.newToSite, false);
      addShortParam(queryParams, "_ss", this.session?.start, false);
    }
    const extraEvents = this.events.slice(1);
    const eventParamsList = extraEvents.map((event) => {
      const eventParams = {};
      addShortParam(eventParams, "en", event.name);
      addEventParams(eventParams, event);
      return eventParams;
    });
    const url = Object.assign(new URL(GA4_ENDPOINT_URL), {
      search: String(new URLSearchParams(queryParams))
    }).href;
    const headers = this.client.headers;
    const body = eventParamsList.map((eventParams) => new URLSearchParams(eventParams).toString()).join("\n");
    const request = new Request(url, {
      method: "POST",
      headers,
      body
    });
    try {
      const start = performance.now();
      const response = await fetch(request);
      const duration = performance.now() - start;
      if (this.session && response.ok) {
        if (this.event != null) {
          this.session.start = void 0;
        }
        const hitCount = this.events.filter(Boolean).length || 1;
        this.session.hitCount += hitCount;
      }
      if (response.status !== 204 || duration >= SLOW_UPLOAD_THRESHOLD) {
        this.warn(`${this.events.length} events uploaded in ${duration}ms. Response: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      this.warn(`Upload failed: ${err}`);
    }
  }
  warn(message) {
    console.warn(`GA4: ${message}`);
  }
}
function getClientId(request) {
  const cookies = getCookies(request.headers);
  return cookies._ga ? cookies._ga : void 0;
}
function getClientIp(request, conn) {
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(/\s*,\s*/)[0];
  } else {
    return conn.remoteAddr.hostname;
  }
}
function getClientLanguage(request) {
  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage == null) {
    return;
  }
  const code2 = acceptLanguage.split(/[^a-z-]+/i).filter(Boolean).shift();
  if (code2 == null) {
    return void 0;
  }
  return code2.toLowerCase();
}
function getClientHeaders(request) {
  const headerList = [...request.headers.entries()].filter(([name, _value]) => {
    name = name.toLowerCase();
    return name === "user-agent" || name === "sec-ch-ua" || name.startsWith("sec-ch-ua-");
  });
  return new Headers(headerList);
}
const START_OF_2020 = (/* @__PURE__ */ new Date("2020-01-01T00:00:00.000Z")).getTime();
const MINUTE = 60 * 1e3;
const sessionMap = /* @__PURE__ */ new WeakMap();
function getSession(conn) {
  let session = sessionMap.get(conn);
  if (session == null) {
    const id = (Math.random() * 2 ** 52).toString(36).padStart(10, "0");
    const number = Math.floor((Date.now() - START_OF_2020) / MINUTE);
    session = {
      id,
      number,
      engaged: true,
      start: true,
      hitCount: 0
    };
    sessionMap.set(conn, session);
  }
  return session;
}
function getPageTitle(request, response) {
  if ((request.method === "GET" || request.method === "HEAD") && isSuccess(response)) {
    return new URL(request.url).pathname.replace(/\.[^\/]*$/, "").split(/\/+/).map(decodeURIComponent).map((s2) => s2.replace(/[\s_]+/g, " ")).map((s2) => s2.replace(/@v?[\d\.\s]+$/, "")).map((s2) => s2.trim()).filter(Boolean).join(" / ") || "/";
  } else {
    return formatStatus(response).toLowerCase();
  }
}
function getPageReferrer(request) {
  const referrer = request.headers.get("referer");
  if (referrer !== null && new URL(referrer).host !== new URL(request.url).host) {
    return referrer;
  }
}
function getFirstVisit(request) {
  return getClientId(request) ? false : true;
}
function getCampaignObject(request) {
  const url = new URL(request.url);
  return {
    name: url.searchParams.get("utm_campaign") || void 0,
    source: url.searchParams.get("utm_source") || void 0,
    medium: url.searchParams.get("utm_medium") || void 0,
    content: url.searchParams.get("utm_content") || void 0,
    term: url.searchParams.get("utm_term") || void 0
  };
}
function formatStatus(response) {
  let {
    status,
    statusText
  } = response;
  statusText ||= STATUS_TEXT[status] ?? "Invalid Status";
  return `${status} ${statusText}`;
}
function isSuccess(response) {
  const {
    status
  } = response;
  return status >= 200 && status <= 299;
}
function addShortParam(params, name, value, implicitDefault) {
  if (value === void 0 || value === implicitDefault) ;
  else if (typeof value === "boolean") {
    params[name] = value ? "1" : "0";
  } else {
    params[name] = String(value);
  }
}
function addCustomParam(params, prefix, name, value) {
  if (value === void 0) {
    return;
  }
  name = snakeCase(name);
  if (typeof value === "number" || typeof value === "bigint") {
    params[`${prefix}n.${name}`] = String(value);
  } else {
    params[`${prefix}.${name}`] = String(value);
  }
}
function addEventParams(params, event) {
  for (const prop of ["category", "label"]) {
    addCustomParam(params, "ep", `event_${prop}`, event[prop]);
  }
  for (const [name, value] of Object.entries(event.params)) {
    addCustomParam(params, "ep", name, value);
  }
}
const encoder = new TextEncoder();
async function toDigest(msg) {
  const buffer = await crypto.subtle.digest("SHA-1", encoder.encode(msg));
  return Array.from(new Uint8Array(buffer)).map((b2) => b2.toString(16).padStart(2, "0")).join("");
}
const track = async (ctx) => {
  const res = await ctx.next();
  if (!res.headers.get("content-type")?.includes("text/html")) {
    return res;
  }
  const report = new GA4Report({
    request: ctx.req,
    response: res,
    conn: {
      remoteAddr: ctx.info.remoteAddr
    }
  });
  await report.send();
  return res;
};
const app = new App$1().use(policy).use(track).use(staticFiles()).fsRoutes();
if (import.meta.main) {
  await app.listen();
}
const root = join$3(import.meta.dirname, "..");
setBuildCache(app, new ProdBuildCache(root, snapshot), "production");
const _fresh_server_entry = {
  fetch: app.handler()
};
function registerStaticFile(prepared) {
  staticFiles$1.set(prepared.name, {
    name: prepared.name,
    contentType: prepared.contentType,
    filePath: prepared.filePath,
    hash: prepared.hash ?? null,
    immutable: prepared.immutable
  });
}
export {
  Canvas as C,
  a$2 as a,
  _fresh_server_entry as default,
  l$2 as l,
  registerStaticFile,
  u$2 as u
};
