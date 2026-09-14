/* Tiruan seadanya lingkungan Google Apps Script.

   Gunanya supaya server/apps-script.gs bisa dijalankan dan diuji di komputer
   sendiri, tanpa perlu deploy dulu. Sheet-nya cuma disimpan di memori: yang
   ditiru hanya secukupnya untuk apa yang dipakai apps-script.gs.

   Dipakai oleh tools/tes-apps-script.js — tidak ada hubungannya dengan situs
   undangan, dan tidak ikut dipakai browser tamu.                            */
function bikinLingkungan() {
  const sheets = {};
  function Sheet(nama) {
    this.nama = nama; this.rows = [];
    this.appendRow = r => { this.rows.push(r.slice()); };
    this.getLastRow = () => this.rows.length;
    this.getRange = (r, c, nr, nc) => ({
      getValues: () => this.rows.slice(r - 1, r - 1 + (nr || 1))
                        .map(row => row.slice(c - 1, c - 1 + (nc || 1))),
      getValue: () => (this.rows[r - 1] || [])[c - 1],
      setValue: v => { while (this.rows.length < r) this.rows.push([]); this.rows[r - 1][c - 1] = v; },
      setValues: vals => { vals.forEach((row, i) => { this.rows[r - 1 + i] = row.slice(); }); },
      setFontWeight: function () { return this; },
      setBackground: function () { return this; }
    });
    this.setFrozenRows = () => this;
    this.autoResizeColumns = () => this;
  }
  const ss = {
    getSheetByName: n => sheets[n] || null,
    insertSheet: n => (sheets[n] = new Sheet(n))
  };
  global.SpreadsheetApp = { getActiveSpreadsheet: () => ss };
  global.ContentService = {
    MimeType: { JSON: 'json' },
    createTextOutput: t => ({ _t: t, setMimeType() { return this; }, getContent() { return this._t; } })
  };
  global.Utilities = { sleep: () => {} };
  return { sheets, ss };
}
module.exports = { bikinLingkungan };
