<template>
  <div :class="['field-wysiwyg border validation', state, { disabled, focused: focus }]">
    <client-only>
      <div class="wysiwyg-container">

        <editor-menu-bar
          v-slot="{ commands, isActive }"
          :editor="editor">
          <div class="toolbar-wrapper">

            <div :class="['toolbar-main', { 'toolbar-secondary-open': secondaryToolbarOpen }]">

              <button
                class="toolbar-button"
                :class="{'is-active': isActive.bold()}"
                @click="commands.bold">
                <Icon name="bold" />
              </button>

              <button
                class="toolbar-button"
                :class="{'is-active': isActive.italic()}"
                @click="commands.italic">
                <Icon name="italic" />
              </button>

              <button
                class="toolbar-button"
                :class="{'is-active': isActive.underline()}"
                @click="commands.underline">
                <Icon name="underline" />
              </button>

              <button
                class="toolbar-button"
                :class="{'is-active': isActive.heading({ level: 1 })}"
                @click="commands.heading({ level: 1 })">
                H1
              </button>

              <button
                class="toolbar-button"
                :class="{'is-active': isActive.heading({ level: 2 })}"
                @click="commands.heading({ level: 2 })">
                H2
              </button>

              <button
                class="toolbar-button"
                :class="{'is-active': isActive.bullet_list()}"
                @click="commands.bullet_list">
                <Icon name="ul" />
              </button>

              <button
                class="toolbar-button"
                :class="{'is-active': isActive.ordered_list()}"
                @click="commands.ordered_list">
                <Icon name="ol" />
              </button>

              <button
                class="toolbar-button"
                @click="commands.undo">
                <Icon name="undo" />
              </button>

              <button
                class="toolbar-button"
                @click="commands.redo">
                <Icon name="redo" />
              </button>

              <button
                class="toolbar-button subtoolbar-toggle-button"
                @click="toggleSecondaryToolbar()">
                •••
              </button>

            </div>

            <div :class="['toolbar-secondary', { open: secondaryToolbarOpen }]">

              <button
                class="toolbar-button"
                :class="{'is-active': isActive.strike()}"
                @click="commands.strike; toggleSecondaryToolbar()">
                <Icon name="strike" />
              </button>

              <button
                class="toolbar-button"
                :class="{'is-active': isActive.blockquote()}"
                @click="commands.blockquote; toggleSecondaryToolbar()">
                <Icon name="quote" />
              </button>

              <button
                class="toolbar-button"
                :class="{'is-active': isActive.heading({ level: 3 })}"
                @click="commands.heading({ level: 3 }); toggleSecondaryToolbar()">
                H3
              </button>

              <button
                class="toolbar-button"
                :class="{'is-active': isActive.heading({ level: 4 })}"
                @click="commands.heading({ level: 4 }); toggleSecondaryToolbar()">
                H4
              </button>

              <button
                class="toolbar-button"
                :class="{'is-active': isActive.heading({ level: 5 })}"
                @click="commands.heading({ level: 5 }); toggleSecondaryToolbar()">
                H5
              </button>

              <button
                class="toolbar-button"
                :class="{'is-active': isActive.heading({ level: 6 })}"
                @click="commands.heading({ level: 6 }); toggleSecondaryToolbar()">
                H6
              </button>

            </div>

          </div>
        </editor-menu-bar>

        <editor-menu-bubble
          v-slot="{ commands, isActive, getMarkAttrs, menu }"
          :editor="editor"
          @hide="hideLinkMenu">
          <div
            class="menububble"
            :class="{ 'is-active': menu.isActive }"
            :style="`left: ${menu.left}px; bottom: ${menu.bottom}px;`">

            <form
              v-if="linkMenuIsActive"
              class="menububble__form"
              @submit.prevent="setLinkUrl(commands.link, linkUrl)">
              <input
                ref="linkInput"
                v-model="linkUrl"
                type="text"
                class="menububble__input"
                placeholder="https://"
                @keydown.esc="hideLinkMenu" />
              <button
                type="button"
                class="menububble__button"
                @click="setLinkUrl(commands.link, null)">
                <IconCloseThick fill="white" />
              </button>
            </form>

            <template v-else>
              <button
                class="menububble__button"
                :class="{ 'is-active': isActive.link() }"
                @click="showLinkMenu(getMarkAttrs('link'))">
                <span class="bubble-link-text">{{ isActive.link() ? 'Update Link' : 'Add Link' }}</span>
                <Icon name="link" />
              </button>
            </template>

          </div>
        </editor-menu-bubble>

        <editor-content
          v-if="editor"
          :editor="editor"
          class="wysiwyg-editor" />

      </div>
    </client-only>
  </div>
</template>

<script>
// ===================================================================== Imports
import {
  Editor,
  EditorContent,
  EditorMenuBar,
  EditorMenuBubble
} from 'tiptap'

import {
  Blockquote,
  HardBreak,
  Heading,
  OrderedList,
  BulletList,
  ListItem,
  TodoItem,
  TodoList,
  Bold,
  Italic,
  Link,
  Strike,
  Underline,
  History,
  Placeholder
} from 'tiptap-extensions'

import Icon from '@/components/admin/form/WysiwygIcons'
import IconCloseThick from '@/components/Icons/CloseThick'

// =================================================================== Functions
const preValidate = (instance, value, pre) => {
  if (typeof pre !== 'string') { return }
  const regex = new RegExp(pre)
  if (regex.test(value)) { // value contains restricted characters
    const stripped = value.replace(regex, '')
    instance.$emit('updateValue', stripped)
    instance.editor.setContent(stripped)
  }
}

// ====================================================================== Export
export default {
  name: 'FieldWysiwyg',

  components: {
    EditorContent,
    EditorMenuBar,
    EditorMenuBubble,
    Icon,
    IconCloseThick
  },

  props: {
    placeholder: {
      type: String,
      required: false,
      default: 'Enter a value'
    },
    value: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pre: {
      type: [String, Boolean],
      required: false,
      default: false
    },
    chars: {
      type: [Number, Boolean],
      required: false,
      default: false
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    }
  },

  data () {
    return {
      editor: false,
      secondaryToolbarOpen: false,
      linkUrl: null,
      linkMenuIsActive: false,
      focus: false
    }
  },

  watch: {
    value (value) {
      preValidate(this, value, this.pre)
    }
  },

  created () {
    if (this.value === '') {
      this.$emit('updateValue', '')
    }
  },

  mounted () {
    this.editor = new Editor({
      content: this.value,
      extensions: [
        new Blockquote(),
        new BulletList(),
        new HardBreak(),
        new Heading({ levels: [1, 2, 3, 4, 5, 6] }),
        new ListItem(),
        new OrderedList(),
        new TodoItem(),
        new TodoList(),
        new Link(),
        new Bold(),
        new Italic(),
        new Strike(),
        new Underline(),
        new History(),
        new Placeholder({
          emptyEditorClass: 'is-editor-empty',
          emptyNodeClass: 'is-empty',
          emptyNodeText: this.placeholder,
          showOnlyWhenEditable: true,
          showOnlyCurrent: true
        })
      ],
      onUpdate: ({ state, getHTML, getJSON, transaction }) => {
        let value = getHTML()
        const stripped = value.replace(/(<([^>]+)>)/gi, '')
        if (stripped === '') { value = '' }
        this.$emit('updateValue', value)
      },
      onFocus: () => {
        this.focus = true
      },
      onBlur: () => {
        this.focus = false
      }
    })
  },

  beforeDestroy () {
    this.editor.destroy()
  },

  methods: {
    toggleSecondaryToolbar () {
      this.secondaryToolbarOpen = !this.secondaryToolbarOpen
    },
    showLinkMenu (attrs) {
      this.linkUrl = attrs.href
      this.linkMenuIsActive = true
      this.$nextTick(() => {
        this.$refs.linkInput.focus()
      })
    },
    hideLinkMenu () {
      this.linkUrl = null
      this.linkMenuIsActive = false
    },
    setLinkUrl (command, url) {
      command({ href: url })
      this.hideLinkMenu()
    }
  }
}
</script>

<style lang="scss" scoped>
$toolbarHeight: 2.5rem;

// ///////////////////////////////////////////////////////////////////// General
.wysiwyg-container {
  display: block;
  position: relative;
  width: 100%;
  height: 20rem;
  &:hover {
    .toolbar-main:not(.toolbar-secondary-open),
    .toolbar-secondary {
      border-color: $coldPurple;
    }
  }
}

.wysiwyg-container,
.toolbar-wrapper {
  border-color: inherit;
}

.markdown-post-content {
  padding: 1rem;
  padding-bottom: 0.5rem;
}

// ///////////////////////////////////////////////////////////////////// Toolbar
.toolbar-main,
.toolbar-secondary {
  display: flex;
  flex-direction: row;
  height: $toolbarHeight;
  padding: 0.125rem 0.25rem;
  border-bottom: 2px solid $whisper;
  transition: 250ms;
}

.toolbar-secondary {
  display: none;
  position: absolute;
  left: 0;
  width: 100%;
  background-color: $athensGray;
  z-index: 10;
  &.open {
    display: flex;
  }
}

.toolbar-button {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  flex: 1;
  max-width: 65px;
  margin: 0.25rem;
  font-size: 0.625rem;
  background-color: white;
  border: 1px solid $whisper;
  border-radius: 4px;
  transition: 250ms ease-out;
  &:hover {
    transition: 250ms ease-in;
    color: white;
    background-color: $electricViolet;
  }
}

// ///////////////////////////////////////////////////////////////// Menu Bubble
::v-deep .menububble {
  position: absolute;
  display: flex;
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
  transform: translateX(-50%);
  visibility: hidden;
  opacity: 0;
  z-index: 20;
  transition: opacity 200ms,visibility 200ms;
  &.is-active {
    opacity: 1;
    visibility: visible;
  }
}

.menububble__button {
  flex: 1;
  border-radius: 0.25rem;
  background-color: $electricViolet;
  color: white;
  font-weight: 500;
  padding: 0.25rem 0.75rem;
  &:hover {
    transform: scale(1.05);
  }
  &:focus {
    @include focusBoxShadow;
  }
  &:active {
    transform: scale(0.95);
  }
  .icon {
    width: 0.75rem;
    height: 0.75rem;
  }
}

.bubble-link-text {
  font-size: 0.75rem;
  text-transform: uppercase;
}

.menububble__form {
  display: flex;
  flex-direction: row;
  align-items: center;
  .menububble__button {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    width: 2rem;
    height: 2rem;
    padding: 0;
  }
}

.menububble__input {
  border-radius: 0.25rem;
  height: 100%;
  background-color: $electricViolet;
  color: white;
  padding: 0 0.5rem;
  margin-right: 0.25rem;
  @include placeholder {
    color: white;
  }
  &:hover,
  &:active,
  &:focus {
    background-color: $electricViolet;
    color: white;
  }
}

.close-thick-svg-icon {
  width: 0.75rem;
}

// /////////////////////////////////////////////////////////////////////// Input
::v-deep .wysiwyg-editor {
  height: calc(100% - #{$toolbarHeight});
  overflow-y: scroll;
  background-color: white;

  .ProseMirror {
    min-height: 100%;
    padding: 1rem;
    &.ProseMirror-focused {
      p.is-editor-empty:first-child {
        display: none;
      }
    }
  }

  p.is-editor-empty:first-child {
    &:before {
      content: attr(data-empty-text);
      position: absolute;
      top: 1rem;
      left: 1rem;
      opacity: 0.5;
      color: black;
    }
  }

  h1, h2, h3, h4, h5, h6 {
    margin: 0;
    margin-bottom: 1rem;
    &:not(:first-child) {
      margin-top: 1rem;
    }
  }

  p, li, span {
    a {
      position: relative;
      cursor: pointer;
    }
  }

  p {
    &:not(:last-child) {
      margin-bottom: 1rem;
    }
    code {
      background-color: $gray200;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
    }
  }

  pre {
    background-color: $gray200;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
  }

  a {
    font-weight: 700;
  }

  blockquote {
    border-left: 5px solid $gray200;
    margin-left: 0.25rem;
    padding-left: 0.75rem;
  }

  ul, ol {
    margin-bottom: 1rem;
    padding: 0 3rem;
    @include tiny {
      padding-left: 1rem;
      padding-right: 0;
    }
    li {
      p {
        display: inline-block;
      }
      &:not(:last-child) {
        margin-bottom: 0.5rem;
      }
    }
  }

  ul {
    li {
      list-style: disc;
    }
  }

  ol {
    li {
      list-style: decimal;
    }
  }
}
</style>
