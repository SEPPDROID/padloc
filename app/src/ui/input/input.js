import '../../styles/shared.js';
import '../base/base.js';
import autosize from '../../../../../node_modules/autosize/src/autosize.js';

let activeInput = null;

// On touch devices, blur active input when tapping on a non-input
document.addEventListener("touchend", () => {
    if (activeInput) {
        activeInput.blur();
    }
});

class PlInput extends padlock.BaseElement {
  static get template() {
    return Polymer.html`
        <style include="shared">
            :host {
                display: block;
                position: relative;
            }

            :host(:not([multiline])) {
                padding: 0 10px;
                height: var(--row-height);
            }

            input {
                box-sizing: border-box;
                text-overflow: ellipsis;
            }

            input, textarea {
                text-align: inherit;
                width: 100%;
                height: 100%;
                min-height: inherit;
                line-height: inherit;
            }

            ::-webkit-search-cancel-button {
                display: none;
            }

            ::-webkit-input-placeholder {
                text-shadow: inherit;
                color: inherit;
                opacity: 0.5;
                @apply --pl-input-placeholder;
            }

            .mask {
                @apply --fullbleed;
                pointer-events: none;
                font-size: 150%;
                line-height: 22px;
                letter-spacing: -4.5px;
                margin-left: -4px;
            }

            input[disabled], textarea[disabled] {
                opacity: 1;
                -webkit-text-fill-color: currentColor;
            }

            input[invisible], textarea[invisible] {
                opacity: 0;
            }
        </style>

        <template is="dom-if" if="[[ multiline ]]" on-dom-change="_domChange">
            <textarea id="input" value="{{ value::input }}" placeholder\$="[[ placeholder ]]" readonly\$="[[ readonly ]]" rows="1" autocomplete="off" spellcheck="false" autocapitalize\$="[[ _computeAutoCapitalize(autocapitalize) ]]" autocorrect="off" on-focus="_focused" on-blur="_blurred" on-change="_changeHandler" on-keydown="_keydown" on-touchend="_stopPropagation" tabindex\$="[[ _tabIndex(noTab) ]]" invisible\$="[[ _showMask(masked, value, focused) ]]" disabled\$="[[ disabled ]]"></textarea>
            <textarea class="mask" value="[[ _mask(value) ]]" tabindex="-1" invisible\$="[[ !_showMask(masked, value, focused) ]]" disabled=""></textarea>
        </template>

        <template is="dom-if" if="[[ !multiline ]]" on-dom-change="_domChange">
            <input id="input" value="{{ value::input }}" tabindex\$="[[ _tabIndex(noTab) ]]" autocomplete="off" spellcheck="false" autocapitalize\$="[[ _computeAutoCapitalize(autocapitalize) ]]" autocorrect="off" type\$="[[ type ]]" placeholder\$="[[ placeholder ]]" readonly\$="[[ readonly ]]" required\$="[[ required ]]" pattern\$="[[ pattern ]]" disabled\$="[[ disabled ]]" on-focus="_focused" on-blur="_blurred" on-change="_changeHandler" on-keydown="_keydown" on-touchend="_stopPropagation" invisible\$="[[ _showMask(masked, value, focused) ]]">
            <input class="mask" value="[[ _mask(value) ]]" tabindex="-1" invisible\$="[[ !_showMask(masked, value, focused) ]]" disabled="">
        </template>
`;
  }

  static get is() { return "pl-input"; }

  static get activeInput() { return activeInput; }

  static get properties() { return {
      autosize: {
          type: Boolean,
          value: false
      },
      autocapitalize: {
          type: Boolean,
          value: false
      },
      disabled: {
          type: Boolean,
          value: false
      },
      focused: {
          type: Boolean,
          value: false,
          notify: true,
          reflectToAttribute: true,
          readonly: true
      },
      invalid: {
          type: Boolean,
          value: false,
          notifiy: true,
          reflectToAttribute: true,
          readonly: true
      },
      masked: {
          type: Boolean,
          value: false,
          reflectToAttribute: true
      },
      multiline: {
          type: Boolean,
          value: false,
          reflectToAttribute: true
      },
      pattern: {
          type: String,
          value: null
      },
      placeholder: {
          type: String,
          value: ""
      },
      noTab: {
          type: Boolean,
          value: false
      },
      readonly: {
          type: Boolean,
          value: false
      },
      required: {
          type: Boolean,
          value: ""
      },
      type: {
          type: String,
          value: "text"
      },
      selectOnFocus: {
          type: Boolean,
          value: false
      },
      value: {
          type: String,
          value: "",
          notify: true,
          observer: "_valueChanged"
      }
  }; }

  get inputElement() {
      return this.root.querySelector(this.multiline ? "textarea" : "input");
  }

  _domChange() {
      if (this.autosize && this.multiline && this.inputElement) {
          autosize(this.inputElement);
      }
      setTimeout(() => this._valueChanged(), 50);
  }

  _stopPropagation(e) {
      e.stopPropagation();
  }

  _focused(e) {
      e.stopPropagation();
      this.focused = true;
      activeInput = this;
      this.dispatchEvent(new CustomEvent("focus"));

      if (this.selectOnFocus) {
          setTimeout(() => this.selectAll(), 10);
      }
  }

  _blurred(e) {
      e.stopPropagation();
      this.focused = false;
      if (activeInput === this) {
          activeInput = null;
      }
      this.dispatchEvent(new CustomEvent("blur"));
  }

  _changeHandler(e) {
      e.stopPropagation();
      this.dispatchEvent(new CustomEvent("change"));
  }

  _keydown(e) {
      if (e.key === "Enter" && !this.multiline) {
          this.dispatchEvent(new CustomEvent("enter"));
          e.preventDefault();
          e.stopPropagation();
      } else if (e.key === "Escape") {
          this.dispatchEvent(new CustomEvent("escape"));
          e.preventDefault();
          e.stopPropagation();
      }
  }

  _valueChanged() {
      this.invalid = this.inputElement && !this.inputElement.checkValidity();
      if (this.autosize && this.multiline) {
          autosize.update(this.inputElement);
      }
  }

  _tabIndex(noTab) {
      return noTab ? "-1" : "";
  }

  _showMask() {
      return this.masked && !!this.value && !this.focused;
  }

  _mask(value) {
      return value && value.replace(/[^\n]/g, "\u2022");
  }

  _computeAutoCapitalize() {
      return this.autocapitalize ? "" : "off";
  }

  focus() {
      this.inputElement.focus();
  }

  blur() {
      this.inputElement.blur();
  }

  selectAll() {
      try {
          this.inputElement.setSelectionRange(0, this.value.length);
      } catch (e) {
          this.inputElement.select();
      }
  }
}

window.customElements.define(PlInput.is, PlInput);

padlock.Input = PlInput;
