/**
 * DownKingo Console Filter v2.0
 *
 * Suprime logs do console de extensões de navegador e scripts de terceiros.
 * Utiliza uma abordagem de whitelist: apenas mensagens que passam pela API
 * do próprio site serão exibidas.
 *
 * @author DownKingo Team
 */
(function () {
  "use strict";

  // ===========================================
  // CONFIGURATION
  // ===========================================

  // Prefixo para logs explícitos do DownKingo (opcional)
  var APP_PREFIX = "[DownKingo]";

  // Padrões de mensagens que devem ser BLOQUEADOS (regex ou string)
  var BLOCKED_PATTERNS = [
    // Extensões de navegador
    /chrome-extension:\/\//i,
    /moz-extension:\/\//i,
    /safari-extension:\/\//i,
    /^EXT\s*-/i,
    /storeHasCashback/i,

    // Cloudflare / Analytics noise
    /XHR finished loading/i,
    /XHR failed loading/i,
    /Fetch failed loading/i,
    /sendObjectBeacon/i,
    /cdn-cgi\/rum/i,

    // Permissions-Policy (não são erros reais, são warnings do browser)
    /Permissions-Policy/i,
    /browsing-topics/i,
    /interest-cohort/i,

    // Preload warnings (informativos, não erros)
    /was preloaded using link preload but not used/i,

    // Script-src fallback (informativo)
    /script-src.*was not explicitly set/i,
    /default-src.*is used as a fallback/i,

    // Message channel (erro de extensão)
    /listener indicated an asynchronous response/i,
    /message channel closed/i,

    // Turnstile internal (normal operation, não precisa logar)
    /Private Access Token challenge/i,

    // Generic extension patterns
    /app\.js:\d+/i,
    /\.sendObjectBeacon/i,
  ];

  // Padrões de mensagens que devem ser SEMPRE PERMITIDOS
  var ALLOWED_PATTERNS = [/^\[DownKingo\]/i, /downkingo/i];

  // ===========================================
  // CORE LOGIC
  // ===========================================

  // Guarda os métodos originais do console
  var originalConsole = {
    log: console.log.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
    debug: console.debug.bind(console),
  };

  /**
   * Converte argumentos para uma string para análise
   */
  function argsToString(args) {
    try {
      return Array.prototype.map
        .call(args, function (arg) {
          if (typeof arg === "string") return arg;
          if (arg instanceof Error)
            return arg.message + " " + (arg.stack || "");
          try {
            return JSON.stringify(arg);
          } catch (e) {
            return String(arg);
          }
        })
        .join(" ");
    } catch (e) {
      return "";
    }
  }

  /**
   * Verifica se a mensagem combina com algum padrão
   */
  function matchesPatterns(message, patterns) {
    for (var i = 0; i < patterns.length; i++) {
      var pattern = patterns[i];
      if (pattern instanceof RegExp) {
        if (pattern.test(message)) return true;
      } else if (typeof pattern === "string") {
        if (message.indexOf(pattern) !== -1) return true;
      }
    }
    return false;
  }

  /**
   * Verifica se a mensagem deve ser exibida
   */
  function shouldShowMessage(args) {
    var message = argsToString(args);

    // Se está na whitelist, sempre mostra
    if (matchesPatterns(message, ALLOWED_PATTERNS)) {
      return true;
    }

    // Se está na blacklist, bloqueia
    if (matchesPatterns(message, BLOCKED_PATTERNS)) {
      return false;
    }

    // Por padrão, mostra (para não perder logs importantes)
    return true;
  }

  /**
   * Cria um wrapper para um método do console
   */
  function createWrapper(method) {
    return function () {
      if (shouldShowMessage(arguments)) {
        originalConsole[method].apply(console, arguments);
      }
    };
  }

  // ===========================================
  // APPLY OVERRIDES
  // ===========================================

  // Aplica os wrappers
  console.log = createWrapper("log");
  console.info = createWrapper("info");
  console.warn = createWrapper("warn");
  console.error = createWrapper("error");
  console.debug = createWrapper("debug");

  // Fornece um método para logs explícitos do app (bypass do filtro)
  console.app = function () {
    var args = Array.prototype.slice.call(arguments);
    args.unshift(APP_PREFIX);
    originalConsole.log.apply(console, args);
  };

  // ===========================================
  // INITIALIZATION LOG (apenas em dev)
  // ===========================================

  if (typeof window !== "undefined") {
    var isDev =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    if (isDev) {
      originalConsole.info(
        APP_PREFIX,
        "Console filter active. Third-party logs suppressed."
      );
    }
  }
})();
