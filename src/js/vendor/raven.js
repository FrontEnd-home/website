function(t, e) {
    "use strict";

    function n(t, e) {
        var n, o;
        e = e || {}, t = "raven" + t.substr(0, 1).toUpperCase() + t.substr(1), document.createEvent ? (n = document.createEvent("HTMLEvents"),
            n.initEvent(t, !0, !0)) : (n = document.createEventObject(), n.eventType = t);
        for (o in e) l(e, o) && (n[o] = e[o]);
        if (document.createEvent) document.dispatchEvent(n);
        else try {
            document.fireEvent("on" + n.eventType.toLowerCase(), n);
        } catch (i) {}
    }

    function o(t) {
        this.name = "RavenConfigError", this.message = t;
    }

    function i(t) {
        var e = U.exec(t),
            n = {},
            i = 7;
        try {
            for (; i--;) n[H[i]] = e[i] || "";
        } catch (s) {
            throw new o("Invalid DSN: " + t);
        }
        if (n.pass) throw new o("Do not specify your private key in the DSN!");
        return n;
    }

    function s(t) {
        return "undefined" == typeof t;
    }

    function r(t) {
        return "function" == typeof t;
    }

    function a(t) {
        return "string" == typeof t;
    }

    function c(t) {
        for (var e in t) return !1;
        return !0;
    }

    function l(t, e) {
        return Object.prototype.hasOwnProperty.call(t, e);
    }

    function u(t, e) {
        var n, o;
        if (s(t.length))
            for (n in t) l(t, n) && e.call(null, n, t[n]);
        else if (o = t.length)
            for (n = 0; o > n; n++) e.call(null, n, t[n]);
    }

    function p() {
        A = "?sentry_version=4&sentry_client=raven-js/" + F.VERSION + "&sentry_key=" + I;
    }

    function h(t, e) {
        var o = [];
        t.stack && t.stack.length && u(t.stack, function(t, e) {
            var n = d(e);
            n && o.push(n);
        }), n("handle", {
            stackInfo: t,
            options: e
        }), g(t.name, t.message, t.url, t.lineno, o, e);
    }

    function d(t) {
        if (t.url) {
            var e, n = {
                    filename: t.url,
                    lineno: t.line,
                    colno: t.column,
                    "function": t.func || "?"
                },
                o = f(t);
            if (o) {
                var i = ["pre_context", "context_line", "post_context"];
                for (e = 3; e--;) n[i[e]] = o[e];
            }
            return n.in_app = !(!O.includePaths.test(n.filename) || /(Raven|TraceKit)\./.test(n["function"]) || /raven\.(min\.)?js$/.test(n.filename)),
                n;
        }
    }

    function f(t) {
        if (t.context && O.fetchContext) {
            for (var e = t.context, n = ~~(e.length / 2), o = e.length, i = !1; o--;)
                if (e[o].length > 300) {
                    i = !0;
                    break;
                }
            if (i) {
                if (s(t.column)) return;
                return [
                    [], e[n].substr(t.column, 50), []
                ];
            }
            return [e.slice(0, n), e[n], e.slice(n + 1)];
        }
    }

    function g(t, e, n, o, i, s) {
        var r, a;
        e += "", ("Error" !== t || e) && (O.ignoreErrors.test(e) || (i && i.length ? (n = i[0].filename || n,
            i.reverse(), r = {
                frames: i
            }) : n && (r = {
            frames: [{
                filename: n,
                lineno: o,
                in_app: !0
            }]
        }), e = m(e, 100), O.ignoreUrls && O.ignoreUrls.test(n) || (!O.whitelistUrls || O.whitelistUrls.test(n)) && (a = o ? e + " at " + o : e,
            w(y({
                exception: {
                    type: t,
                    value: e
                },
                stacktrace: r,
                culprit: n,
                message: a
            }, s)))));
    }

    function y(t, e) {
        return e ? (u(e, function(e, n) {
            t[e] = n;
        }), t) : t;
    }

    function m(t, e) {
        return t.length <= e ? t : t.substr(0, e) + "\u2026";
    }

    function v() {
        var t = {
            url: document.location.href,
            headers: {
                "User-Agent": navigator.userAgent
            }
        };
        return document.referrer && (t.headers.Referer = document.referrer), t;
    }

    function w(t) {
        _() && (t = y({
                project: $,
                logger: O.logger,
                site: O.site,
                platform: "javascript",
                request: v()
            }, t), t.tags = y(O.tags, t.tags), t.extra = y(O.extra, t.extra), c(t.tags) && delete t.tags,
            c(t.extra) && delete t.extra, R && (t.user = R), r(O.dataCallback) && (t = O.dataCallback(t)), (!r(O.shouldSendCallback) || O.shouldSendCallback(t)) && (L = t.event_id || (t.event_id = C()),
                b(t)));
    }

    function b(t) {
        var e = new Image(),
            o = N + A + "&sentry_data=" + encodeURIComponent(JSON.stringify(t));
        e.onload = function() {
            n("success", {
                data: t,
                src: o
            });
        }, e.onerror = e.onabort = function() {
            n("failure", {
                data: t,
                src: o
            });
        }, e.src = o;
    }

    function _() {
        return M ? N ? !0 : (S("error", "Error: Raven has not been configured."), !1) : !1;
    }

    function k(t) {
        for (var e, n = [], o = 0, i = t.length; i > o; o++) e = t[o], a(e) ? n.push(e.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1")) : e && e.source && n.push(e.source);
        return new RegExp(n.join("|"), "i");
    }

    function C() {
        return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, function(t) {
            var e = 16 * Math.random() | 0,
                n = "x" == t ? e : 3 & e | 8;
            return n.toString(16);
        });
    }

    function S(e, n) {
        t.console && console[e] && F.debug && console[e](n);
    }

    function E() {
        var e = t.RavenConfig;
        e && F.config(e.dsn, e.config).install();
    }
    var x = {
            remoteFetching: !1,
            collectWindowErrors: !0,
            linesOfContext: 7
        },
        T = [].slice,
        P = "?";
    x.wrap = function(t) {
        function e() {
            try {
                return t.apply(this, arguments);
            } catch (e) {
                throw x.report(e), e;
            }
        }
        return e;
    }, x.report = function() {
        function n(t) {
            a(), f.push(t);
        }

        function o(t) {
            for (var e = f.length - 1; e >= 0; --e) f[e] === t && f.splice(e, 1);
        }

        function i() {
            c(), f = [];
        }

        function s(t, e) {
            var n = null;
            if (!e || x.collectWindowErrors) {
                for (var o in f)
                    if (l(f, o)) try {
                        f[o].apply(null, [t].concat(T.call(arguments, 2)));
                    } catch (i) {
                        n = i;
                    }
                if (n) throw n;
            }
        }

        function r(t, e, n, o, i) {
            var r = null;
            if (m) x.computeStackTrace.augmentStackTraceWithInitialElement(m, e, n, t), u();
            else if (i) r = x.computeStackTrace(i),
                s(r, !0);
            else {
                var a = {
                    url: e,
                    line: n,
                    column: o
                };
                a.func = x.computeStackTrace.guessFunctionName(a.url, a.line), a.context = x.computeStackTrace.gatherContext(a.url, a.line),
                    r = {
                        message: t,
                        url: document.location.href,
                        stack: [a]
                    }, s(r, !0);
            }
            return h ? h.apply(this, arguments) : !1;
        }

        function a() {
            d || (h = t.onerror, t.onerror = r, d = !0);
        }

        function c() {
            d && (t.onerror = h, d = !1, h = e);
        }

        function u() {
            var t = m,
                e = g;
            g = null, m = null, y = null, s.apply(null, [t, !1].concat(e));
        }

        function p(e, n) {
            var o = T.call(arguments, 1);
            if (m) {
                if (y === e) return;
                u();
            }
            var i = x.computeStackTrace(e);
            if (m = i, y = e, g = o, t.setTimeout(function() {
                    y === e && u();
                }, i.incomplete ? 2e3 : 0), n !== !1) throw e;
        }
        var h, d, f = [],
            g = null,
            y = null,
            m = null;
        return p.subscribe = n, p.unsubscribe = o, p.uninstall = i, p;
    }(), x.computeStackTrace = function() {
        function e(e) {
            if (!x.remoteFetching) return "";
            try {
                var n = function() {
                        try {
                            return new t.XMLHttpRequest();
                        } catch (e) {
                            return new t.ActiveXObject("Microsoft.XMLHTTP");
                        }
                    },
                    o = n();
                return o.open("GET", e, !1), o.send(""), o.responseText;
            } catch (i) {
                return "";
            }
        }

        function n(t) {
            if (!a(t)) return [];
            if (!l(_, t)) {
                var n = ""; - 1 !== t.indexOf(document.domain) && (n = e(t)), _[t] = n ? n.split("\n") : [];
            }
            return _[t];
        }

        function o(t, e) {
            var o, i = /function ([^(]*)\(([^)]*)\)/,
                r = /['"]?([0-9A-Za-z$_]+)['"]?\s*[:=]\s*(function|eval|new Function)/,
                a = "",
                c = 10,
                l = n(t);
            if (!l.length) return P;
            for (var u = 0; c > u; ++u)
                if (a = l[e - u] + a, !s(a)) {
                    if (o = r.exec(a)) return o[1];
                    if (o = i.exec(a)) return o[1];
                }
            return P;
        }

        function i(t, e) {
            var o = n(t);
            if (!o.length) return null;
            var i = [],
                r = Math.floor(x.linesOfContext / 2),
                a = r + x.linesOfContext % 2,
                c = Math.max(0, e - r - 1),
                l = Math.min(o.length, e + a - 1);
            e -= 1;
            for (var u = c; l > u; ++u) s(o[u]) || i.push(o[u]);
            return i.length > 0 ? i : null;
        }

        function r(t) {
            return t.replace(/[\-\[\]{}()*+?.,\\\^$|#]/g, "\\$&");
        }

        function c(t) {
            return r(t).replace("<", "(?:<|&lt;)").replace(">", "(?:>|&gt;)").replace("&", "(?:&|&amp;)").replace('"', '(?:"|&quot;)').replace(/\s+/g, "\\s+");
        }

        function u(t, e) {
            for (var o, i, s = 0, r = e.length; r > s; ++s)
                if ((o = n(e[s])).length && (o = o.join("\n"),
                        i = t.exec(o))) return {
                    url: e[s],
                    line: o.substring(0, i.index).split("\n").length,
                    column: i.index - o.lastIndexOf("\n", i.index) - 1
                };
            return null;
        }

        function p(t, e, o) {
            var i, s = n(e),
                a = new RegExp("\\b" + r(t) + "\\b");
            return o -= 1, s && s.length > o && (i = a.exec(s[o])) ? i.index : null;
        }

        function h(e) {
            for (var n, o, i, s, a = [t.location.href], l = document.getElementsByTagName("script"), p = "" + e, h = /^function(?:\s+([\w$]+))?\s*\(([\w\s,]*)\)\s*\{\s*(\S[\s\S]*\S)\s*\}\s*$/, d = /^function on([\w$]+)\s*\(event\)\s*\{\s*(\S[\s\S]*\S)\s*\}\s*$/, f = 0; f < l.length; ++f) {
                var g = l[f];
                g.src && a.push(g.src);
            }
            if (i = h.exec(p)) {
                var y = i[1] ? "\\s+" + i[1] : "",
                    m = i[2].split(",").join("\\s*,\\s*");
                n = r(i[3]).replace(/;$/, ";?"), o = new RegExp("function" + y + "\\s*\\(\\s*" + m + "\\s*\\)\\s*{\\s*" + n + "\\s*}");
            } else o = new RegExp(r(p).replace(/\s+/g, "\\s+"));
            if (s = u(o, a)) return s;
            if (i = d.exec(p)) {
                var v = i[1];
                if (n = c(i[2]), o = new RegExp("on" + v + "=[\\'\"]\\s*" + n + "\\s*[\\'\"]", "i"),
                    s = u(o, a[0])) return s;
                if (o = new RegExp(n), s = u(o, a)) return s;
            }
            return null;
        }

        function d(t) {
            if (!t.stack) return null;
            for (var e, n, r = /^\s*at (?:((?:\[object object\])?\S+(?: \[as \S+\])?) )?\(?((?:file|https?|chrome-extension):.*?):(\d+)(?::(\d+))?\)?\s*$/i, a = /^\s*(\S*)(?:\((.*?)\))?@((?:file|https?|chrome).*?):(\d+)(?::(\d+))?\s*$/i, c = t.stack.split("\n"), l = [], u = /^(.*) is undefined$/.exec(t.message), h = 0, d = c.length; d > h; ++h) {
                if (e = a.exec(c[h])) n = {
                    url: e[3],
                    func: e[1] || P,
                    args: e[2] ? e[2].split(",") : "",
                    line: +e[4],
                    column: e[5] ? +e[5] : null
                };
                else {
                    if (!(e = r.exec(c[h]))) continue;
                    n = {
                        url: e[2],
                        func: e[1] || P,
                        line: +e[3],
                        column: e[4] ? +e[4] : null
                    };
                }!n.func && n.line && (n.func = o(n.url, n.line)), n.line && (n.context = i(n.url, n.line)),
                    l.push(n);
            }
            return l.length ? (l[0].line && !l[0].column && u ? l[0].column = p(u[1], l[0].url, l[0].line) : l[0].column || s(t.columnNumber) || (l[0].column = t.columnNumber + 1), {
                name: t.name,
                message: t.message,
                url: document.location.href,
                stack: l
            }) : null;
        }

        function f(t) {
            for (var e, n = t.stacktrace, s = / line (\d+), column (\d+) in (?:<anonymous function: ([^>]+)>|([^\)]+))\((.*)\) in (.*):\s*$/i, r = n.split("\n"), a = [], c = 0, l = r.length; l > c; c += 2)
                if (e = s.exec(r[c])) {
                    var u = {
                        line: +e[1],
                        column: +e[2],
                        func: e[3] || e[4],
                        args: e[5] ? e[5].split(",") : [],
                        url: e[6]
                    };
                    if (!u.func && u.line && (u.func = o(u.url, u.line)), u.line) try {
                        u.context = i(u.url, u.line);
                    } catch (p) {}
                    u.context || (u.context = [r[c + 1]]), a.push(u);
                }
            return a.length ? {
                name: t.name,
                message: t.message,
                url: document.location.href,
                stack: a
            } : null;
        }

        function g(e) {
            var s = e.message.split("\n");
            if (s.length < 4) return null;
            var r, a, p, h, d = /^\s*Line (\d+) of linked script ((?:file|https?)\S+)(?:: in function (\S+))?\s*$/i,
                f = /^\s*Line (\d+) of inline#(\d+) script in ((?:file|https?)\S+)(?:: in function (\S+))?\s*$/i,
                g = /^\s*Line (\d+) of function script\s*$/i,
                y = [],
                m = document.getElementsByTagName("script"),
                v = [];
            for (a in m) l(m, a) && !m[a].src && v.push(m[a]);
            for (a = 2, p = s.length; p > a; a += 2) {
                var w = null;
                if (r = d.exec(s[a])) w = {
                    url: r[2],
                    func: r[3],
                    line: +r[1]
                };
                else if (r = f.exec(s[a])) {
                    w = {
                        url: r[3],
                        func: r[4]
                    };
                    var b = +r[1],
                        _ = v[r[2] - 1];
                    if (_ && (h = n(w.url))) {
                        h = h.join("\n");
                        var k = h.indexOf(_.innerText);
                        k >= 0 && (w.line = b + h.substring(0, k).split("\n").length);
                    }
                } else if (r = g.exec(s[a])) {
                    var C = t.location.href.replace(/#.*$/, ""),
                        S = r[1],
                        E = new RegExp(c(s[a + 1]));
                    h = u(E, [C]), w = {
                        url: C,
                        line: h ? h.line : S,
                        func: ""
                    };
                }
                if (w) {
                    w.func || (w.func = o(w.url, w.line));
                    var x = i(w.url, w.line),
                        T = x ? x[Math.floor(x.length / 2)] : null;
                    w.context = x && T.replace(/^\s*/, "") === s[a + 1].replace(/^\s*/, "") ? x : [s[a + 1]],
                        y.push(w);
                }
            }
            return y.length ? {
                name: e.name,
                message: s[0],
                url: document.location.href,
                stack: y
            } : null;
        }

        function y(t, e, n, s) {
            var r = {
                url: e,
                line: n
            };
            if (r.url && r.line) {
                t.incomplete = !1, r.func || (r.func = o(r.url, r.line)), r.context || (r.context = i(r.url, r.line));
                var a = / '([^']+)' /.exec(s);
                if (a && (r.column = p(a[1], r.url, r.line)), t.stack.length > 0 && t.stack[0].url === r.url) {
                    if (t.stack[0].line === r.line) return !1;
                    if (!t.stack[0].line && t.stack[0].func === r.func) return t.stack[0].line = r.line,
                        t.stack[0].context = r.context, !1;
                }
                return t.stack.unshift(r), t.partial = !0, !0;
            }
            return t.incomplete = !0, !1;
        }

        function m(t, e) {
            for (var n, i, s, r = /function\s+([_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*)?\s*\(/i, a = [], c = {}, l = !1, u = m.caller; u && !l; u = u.caller)
                if (u !== v && u !== x.report) {
                    if (i = {
                            url: null,
                            func: P,
                            line: null,
                            column: null
                        }, u.name ? i.func = u.name : (n = r.exec(u.toString())) && (i.func = n[1]), s = h(u)) {
                        i.url = s.url, i.line = s.line, i.func === P && (i.func = o(i.url, i.line));
                        var d = / '([^']+)' /.exec(t.message || t.description);
                        d && (i.column = p(d[1], s.url, s.line));
                    }
                    c["" + u] ? l = !0 : c["" + u] = !0, a.push(i);
                }
            e && a.splice(0, e);
            var f = {
                name: t.name,
                message: t.message,
                url: document.location.href,
                stack: a
            };
            return y(f, t.sourceURL || t.fileName, t.line || t.lineNumber, t.message || t.description),
                f;
        }

        function v(t, e) {
            var n = null;
            e = null == e ? 0 : +e;
            try {
                if (n = f(t)) return n;
            } catch (o) {
                if (b) throw o;
            }
            try {
                if (n = d(t)) return n;
            } catch (o) {
                if (b) throw o;
            }
            try {
                if (n = g(t)) return n;
            } catch (o) {
                if (b) throw o;
            }
            try {
                if (n = m(t, e + 1)) return n;
            } catch (o) {
                if (b) throw o;
            }
            return {};
        }

        function w(t) {
            t = (null == t ? 0 : +t) + 1;
            try {
                throw new Error();
            } catch (e) {
                return v(e, t + 1);
            }
        }
        var b = !1,
            _ = {};
        return v.augmentStackTraceWithInitialElement = y, v.guessFunctionName = o, v.gatherContext = i,
            v.ofCaller = w, v;
    }();
    var D, L, N, R, I, $, A, B = t.Raven,
        M = !(!t.JSON || !t.JSON.stringify),
        O = {
            logger: "javascript",
            ignoreErrors: [],
            ignoreUrls: [],
            whitelistUrls: [],
            includePaths: [],
            collectWindowErrors: !0,
            tags: {},
            extra: {}
        },
        j = !1,
        F = {
            VERSION: "1.1.16",
            debug: !0,
            noConflict: function() {
                return t.Raven = B, F;
            },
            config: function(t, e) {
                if (N) return S("error", "Error: Raven has already been configured"), F;
                if (!t) return F;
                var n = i(t),
                    o = n.path.lastIndexOf("/"),
                    s = n.path.substr(1, o);
                return e && u(e, function(t, e) {
                        O[t] = e;
                    }), O.ignoreErrors.push("Script error."), O.ignoreErrors.push("Script error"), O.ignoreErrors.push("Javascript error: Script error on line 0"),
                    O.ignoreErrors.push("Javascript error: Script error. on line 0"), O.ignoreErrors = k(O.ignoreErrors),
                    O.ignoreUrls = O.ignoreUrls.length ? k(O.ignoreUrls) : !1, O.whitelistUrls = O.whitelistUrls.length ? k(O.whitelistUrls) : !1,
                    O.includePaths = k(O.includePaths), I = n.user, $ = n.path.substr(o + 1), N = "//" + n.host + (n.port ? ":" + n.port : "") + "/" + s + "api/" + $ + "/store/",
                    n.protocol && (N = n.protocol + ":" + N), O.fetchContext && (x.remoteFetching = !0),
                    O.linesOfContext && (x.linesOfContext = O.linesOfContext), x.collectWindowErrors = !!O.collectWindowErrors,
                    p(), F;
            },
            install: function() {
                return _() && !j && (x.report.subscribe(h), j = !0), F;
            },
            context: function(t, n, o) {
                return r(t) && (o = n || [], n = t, t = e), F.wrap(t, n).apply(this, o);
            },
            wrap: function(t, n) {
                function o() {
                    for (var e = [], o = arguments.length, i = !t || t && t.deep !== !1; o--;) e[o] = i ? F.wrap(t, arguments[o]) : arguments[o];
                    try {
                        return n.apply(this, e);
                    } catch (s) {
                        throw F.captureException(s, t), s;
                    }
                }
                if (s(n) && !r(t)) return t;
                if (r(t) && (n = t, t = e), !r(n)) return n;
                if (n.__raven__) return n;
                for (var i in n) l(n, i) && (o[i] = n[i]);
                return o.__raven__ = !0, o.__inner__ = n, o;
            },
            uninstall: function() {
                return x.report.uninstall(), j = !1, F;
            },
            captureException: function(t, e) {
                if (!(t instanceof Error)) return F.captureMessage(t, e);
                D = t;
                try {
                    x.report(t, e);
                } catch (n) {
                    if (t !== n) throw n;
                }
                return F;
            },
            captureMessage: function(t, e) {
                return w(y({
                    message: t + ""
                }, e)), F;
            },
            setUserContext: function(t) {
                return R = t, F;
            },
            setExtraContext: function(t) {
                return O.extra = t || {}, F;
            },
            setTagsContext: function(t) {
                return O.tags = t || {}, F;
            },
            lastException: function() {
                return D;
            },
            lastEventId: function() {
                return L;
            }
        };
    F.setUser = F.setUserContext;
    var H = "source protocol user pass host port path".split(" "),
        U = /^(?:(\w+):)?\/\/(\w+)(:\w+)?@([\w\.-]+)(?::(\d+))?(\/.*)/;
    o.prototype = new Error(), o.prototype.constructor = o, E(), t.Raven = F, "function" == typeof define && define.amd && define("raven", [], function() {
        return F;
    });
}(this)