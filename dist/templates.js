(function() {
  'use strict';

  var globals = typeof global === 'undefined' ? self : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = {}.hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    return aliases[name] ? expandAlias(aliases[name]) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (bundle && typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();
require.define("templates/modifier.jade", function(exports, require, module) { var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<g class=\"rotatable option\"><g class=\"scalable\"><rect class=\"option-rect\"></rect></g><path d=\"M0,0 15,0 15,5 0,5z\" class=\"btn-remove-modifier\"></path><text class=\"option-text\"></text></g>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
 });

;require.define("templates/modifier_type.jade", function(exports, require, module) { var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (model_name, modifier_data) {
buf.push("<div class=\"row\"><div class=\"col\"><label for=\"modifier-name\">Modifier name</label><input id=\"modifier-name\" type=\"text\" placeholder=\"Modifier name\"" + (jade.attr("value", model_name, true, false)) + "/></div></div><div class=\"row\"><div class=\"col\"><label for=\"modifier-type\">Modifier type </label><select id=\"modifier-type\"><option value=\"\">Please select...</option></option><option value=\"Ob\"" + (jade.attr("selected", modifier_data.type=='Ob', true, false)) + ">Ob </option></select></div></div><div id=\"modifier-parameters\"></div>");}.call(this,"model_name" in locals_for_with?locals_for_with.model_name:typeof model_name!=="undefined"?model_name:undefined,"modifier_data" in locals_for_with?locals_for_with.modifier_data:typeof modifier_data!=="undefined"?modifier_data:undefined));;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
 });

;require.define("templates/modifier_type_ob.jade", function(exports, require, module) { var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (modifier_data) {
buf.push("<div class=\"row\"><div class=\"col\"><label for=\"ob_property\">Ob to modify</label><select id=\"ob_property\" class=\"select-value-change\"><option value=\"\">Please select...</option></option><option value=\"heart_rate\"" + (jade.attr("selected", modifier_data.params.transition_type=='heart_rate', true, false)) + ">Heart rate</option><option value=\"foot_smell\"" + (jade.attr("selected", modifier_data.params.transition_type=='foot_smell', true, false)) + ">Foot smell </option><option value=\"hair_loss\"" + (jade.attr("selected", modifier_data.params.transition_type=='hair_loss', true, false)) + ">Hair loss </option></select></div></div><div class=\"row\"><div class=\"col\"><label for=\"transition_type\">Transition type</label><select id=\"transition_type\" class=\"select-value-change\"><option value=\"\">Please select...</option></option><option value=\"linear\"" + (jade.attr("selected", modifier_data.params.transition_type=='linear', true, false)) + ">Linear </option><option value=\"exponential\"" + (jade.attr("selected", modifier_data.params.transition_type=='exponential', true, false)) + ">Exponential </option></select></div></div><div class=\"row\"><div class=\"col\"><label for=\"start_time\">Start time</label><input id=\"start_time\" type\"text=\"type\"text\" placeholder=\"Enter a value\"" + (jade.attr("value", modifier_data.params.start_time, true, false)) + " class=\"keypress-value-change\"/></div></div><div class=\"row\"><div class=\"col\"><label for=\"end_time\">End time </label><input id=\"end_time\" type\"text=\"type\"text\" placeholder=\"Enter a value\"" + (jade.attr("value", modifier_data.params.end_time, true, false)) + " class=\"keypress-value-change\"/></div></div><div class=\"row\"><div class=\"col\"><label for=\"duration\">Duration</label><input id=\"duration\" type\"text=\"type\"text\" placeholder=\"Enter a value\"" + (jade.attr("value", modifier_data.params.duration, true, false)) + " class=\"keypress-value-change\"/></div></div>");}.call(this,"modifier_data" in locals_for_with?locals_for_with.modifier_data:typeof modifier_data!=="undefined"?modifier_data:undefined));;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
 });

;require.define("templates/question.jade", function(exports, require, module) { var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<g class=\"rotatable\"><g class=\"scalable\"><rect class=\"body\"></rect></g><text class=\"question-text\"></text><path d=\"M5,0 10,0 10,5 15,5 15,10 10,10 10,15 5,15 5,10 0,10 0,5 5,5z\" class=\"btn-add-modifier\"></path><path d=\"M5,0 10,0 10,5 15,5 15,10 10,10 10,15 5,15 5,10 0,10 0,5 5,5z\" class=\"btn-add-trigger\"></path></g>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
 });

;require.define("templates/state_parameters.jade", function(exports, require, module) { var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (app, model_name, state_data) {
buf.push("<form><div class=\"form-group\"><label for=\"state-name\">State name</label><input id=\"state-name\" type=\"text\"" + (jade.attr("value", model_name, true, false)) + " class=\"form-control\"/></div><div class=\"form-group\"><label for=\"initial-state-check \" class=\"form-check-label\"><input id=\"initial-state-check\" type=\"checkbox\" class=\"form-check-input\"/>Initial state?</label></div><div class=\"form-group\"><label for=\"ob-select\">Add ob</label><select id=\"ob-select\" name=\"\" class=\"form-control\"><option value=\"\">Please select...</option><option value=\"heart_rate\" data-default-value=\"0\">Heart rate</option><option value=\"foot_smell\" data-default-value=\"10\">Foot smell</option><option value=\"hair_loss\" data-default-value=\"22\">Hair loss</option></select></div><div class=\"row\"><div class=\"col\"><table class=\"table\"><thead class=\"thead-inverse\"><tr><th>Ob</th><th>Value</th></tr></thead><tbody>");
for(var ob in state_data.obs){
{
buf.push("<tr><td>" + (((jade_interp = app.dictionary.ob_names[ob] || ob) == null ? '' : jade_interp)) + "</td><td><input" + (jade.attr("id", "ob-value-" + ob, true, false)) + " type=\"text\"" + (jade.attr("data-ob-key", ob, true, false)) + (jade.attr("value", state_data.obs[ob], true, false)) + " class=\"ob-value\"/></td></tr>");
}
}
buf.push("</tbody></table></div></div></form>");}.call(this,"app" in locals_for_with?locals_for_with.app:typeof app!=="undefined"?app:undefined,"model_name" in locals_for_with?locals_for_with.model_name:typeof model_name!=="undefined"?model_name:undefined,"state_data" in locals_for_with?locals_for_with.state_data:typeof state_data!=="undefined"?state_data:undefined));;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
 });

;require.define("templates/trigger.jade", function(exports, require, module) { var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<g class=\"rotatable trigger\"><g class=\"scalable\"><rect class=\"trigger-rect\"></rect></g><path d=\"M0,0 15,0 15,5 0,5z\" class=\"btn-remove-trigger\"></path><text class=\"trigger-text\"></text></g>");;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
 });

;require.define("templates/trigger_type.jade", function(exports, require, module) { var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (model_name, trigger_data) {
buf.push("<div class=\"row\"><div class=\"col\"><label for=\"trigger-name\">Trigger name</label><input id=\"trigger-name\" type=\"text\" placeholder=\"Trigger name\"" + (jade.attr("value", model_name, true, false)) + "/></div></div><div class=\"row\"><div class=\"col\"><label for=\"trigger-type\">Trigger type </label><select id=\"trigger-type\"><option value=\"\">Please select...</option></option><option value=\"GiveDrug\"" + (jade.attr("selected", trigger_data.type=='GiveDrug', true, false)) + ">GiveDrug </option><option value=\"TimeLimit\"" + (jade.attr("selected", trigger_data.type=='TimeLimit', true, false)) + ">TimeLimit </option></select></div></div><div id=\"trigger-parameters\"></div>");}.call(this,"model_name" in locals_for_with?locals_for_with.model_name:typeof model_name!=="undefined"?model_name:undefined,"trigger_data" in locals_for_with?locals_for_with.trigger_data:typeof trigger_data!=="undefined"?trigger_data:undefined));;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
 });

;require.define("templates/trigger_type_give_drug.jade", function(exports, require, module) { var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (trigger_data) {
buf.push("<div class=\"row\"><div class=\"col\"><label for=\"comparison\">Comparison</label><select id=\"comparison\"><option value=\"\">Please select...</option></option><option value=\"at_least\"" + (jade.attr("selected", trigger_data.params.comparison=='at_least', true, false)) + ">At least</option><option value=\"exactly\"" + (jade.attr("selected", trigger_data.params.comparison=='exactly', true, false)) + ">Exactly</option><option value=\"no_more_than\"" + (jade.attr("selected", trigger_data.params.comparison=='no_more_than', true, false)) + ">No more than</option></select></div></div><div class=\"row\"><div class=\"col\"><label for=\"dose\">Dose <input id=\"dose\" type=\"text\" placeholder=\"Enter a value\"" + (jade.attr("value", trigger_data.params.dose, true, false)) + "/></label></div></div><div class=\"row\"><div class=\"col\"><label for=\"dose_unit\">Unit </label><select id=\"dose_unit\"><option value=\"\">Please select...</option><option value=\"mg\"" + (jade.attr("selected", trigger_data.params.dose_unit=='mg', true, false)) + ">mg </option><option value=\"kg\"" + (jade.attr("selected", trigger_data.params.dose_unit=='kg', true, false)) + ">kg </option></select></div></div><div class=\"row\"><div class=\"col\"><label for=\"drug_name\">Drug name</label><select id=\"drug\"><option value=\"\">Please select...</option><option value=\"panadol\"" + (jade.attr("selected", trigger_data.params.drug=='panadol', true, false)) + ">Panadol</option><option value=\"neurophen\"" + (jade.attr("selected", trigger_data.params.drug=='neurophen', true, false)) + ">Neurophen </option></select></div></div>");}.call(this,"trigger_data" in locals_for_with?locals_for_with.trigger_data:typeof trigger_data!=="undefined"?trigger_data:undefined));;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
 });

;require.define("templates/trigger_type_time_limit.jade", function(exports, require, module) { var __templateData = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (trigger_data) {
buf.push("<label for=\"time_limit\"><Duration></Duration><input id=\"time_limit\" type=\"text\"" + (jade.attr("value", trigger_data.params.time_limit, true, false)) + "/></label>");}.call(this,"trigger_data" in locals_for_with?locals_for_with.trigger_data:typeof trigger_data!=="undefined"?trigger_data:undefined));;return buf.join("");
};
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
 });

;
//# sourceMappingURL=templates.js.map