import '../../styles/shared.js';
import '../base/base.js';
import '../dialog/dialog.js';
import './export.js';

const { BaseElement, LocaleMixin } = padlock;

class PlExportDialog extends LocaleMixin(BaseElement) {
  static get template() {
    return Polymer.html`
        <style include="shared">
            :host {
                --pl-dialog-inner: {
                    background: linear-gradient(rgb(89, 198, 255) 0%, rgb(7, 124, 185) 100%);
                };
            }

            .message {
                font-weight: bold;
            }
        </style>

        <pl-dialog id="dialog">
            <div class="message">[[ \$l("Export {0} Records", records.length) ]]</div>
            <pl-export export-records="[[ records ]]" on-click="_close" class="tiles-2"></pl-export>
        </pl-dialog>
`;
  }

  static get is() { return "pl-export-dialog"; }

  static get properties() { return {
      records: Array
  }; }

  _close() {
      this.$.dialog.open = false;
  }

  export(records) {
      this.records = records;
      this.$.dialog.open = true;
  }
}

window.customElements.define(PlExportDialog.is, PlExportDialog);
