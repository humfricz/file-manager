/*jslint node: true */
"use strict";

class Parser {

  constructor(paths) {
    this.set(paths);
    this.tree();
  };

  set(paths) {
    this.paths = paths;
    this.levels = [],
    this.a = {};
  };

  /** Builds the trees from file paths */
  tree() {
    var that = this;

    this.paths.forEach(function (value, key) {
      that.levels.push(that.explodeTree((value.path.split('/').filter(function (value) {return !(value === '')})), value._id, that));
    });

    return this.levels;
  }

  /** Returns directories & files
   *
   *  @param string dir (optional)
   *
   * If is left blank. Only root list will be returned
   *
   * ==========================================================
   *
   * If a directory is requested
   *
   * Input
   *  /tmp/dir-test/
   *
   * Output
   *   [Object { etc={...},  tmp={...}}, Object { dir-test={...},  dir-test-1={...}}, Object { qwe2={...},  qwe3={...}}]
   *
   * Each element ( Object{...} ... ) represents a column in the file manager
   */
  getLevel(dir) {

    var level = [];

    /** Builds the root level (/) */
    if(typeof dir === 'undefined') {

      var obj = {};

      this.levels.forEach(function(value, key) {

        /** FILE */
        if(typeof value[1].path !== 'undefined') {
          obj[value[1].path] = {type: 'file', '_id': value[1].id};
        }

        /** DIR */
        if(typeof value[1].path === 'undefined') {
          obj[value[0]] = {type: 'dir', 'marked': false};
        }
      });

      level.push(obj);
    }

    /** If a directory is requested
     *
     * Input
     *  /tmp/dir-test/
     *
     * Output
     *   [Object { etc={...},  tmp={...}}, Object { dir-test={...},  dir-test-1={...}}, Object { qwe2={...},  qwe3={...}}]
     *
     * Each element ( Object{...} ... ) represents a column in the file manager
     *
     */
    else if(typeof dir === 'string') {

      var
        request = dir.split('/').filter(function (value) {return !(value === '')}),
        that = this,
        next = this.levels;

      console.log("Next", next);

      level = this.getLevel(); //the root level

      request.forEach(function(name, key) {
        var list = that.listDir(name, next, that);

        if(Object.keys(list.obj).length === 0 && JSON.stringify(list.obj) === JSON.stringify({})) {
          throw new Error("Directory " + name + " is not found");
        }

        next = list.next;
        level.push(list.obj);
      });
    }

    return level;
  }

  /** Lists a directory from a chosen list
   *
   *  @param string request_name Name of the directory
   *  @param string inn Structure parsed like from explodeTree
   */
  listDir(request_name, inn) {

    var next = [];
    var obj = {};

    inn.forEach(function(item, key) {
      var name = item[0];
      var options = item[1];

      if(name == request_name) {

        /** FILE */
        if(typeof options[1].path !== 'undefined') {
          obj[options[0]] = {type: 'file', '_id': options[1].id};
        }

        /** DIR */
        if(typeof options[1].path === 'undefined') {
          obj[options[0]] = {type: 'dir', 'marked': false};
          next.push(options);
        }
      }
    });

    return {
      'obj': obj,
      'next': next
    };
  }

  /** Parses file paths to multidimensional array (file tree) with options */
  explodeTree(parts, _id, that) {
    var r = [];

    r.push(parts.shift());
    parts.forEach(function (value, key) {

      var w = that.explodeTree(parts, _id, that);

      /** If we are on last element (file). Assign the ID and PATH props */
      r.push(((w.length == (key + 1) && w.length == 1) ? [w[0], {'id': _id, 'path': w[0]}] : w));
    });

    return r;
  }
}

export default Parser;