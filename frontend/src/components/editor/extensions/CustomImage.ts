import { mergeAttributes } from '@tiptap/core';
import Image from '@tiptap/extension-image';

export const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: 'left',
        parseHTML: element => element.getAttribute('data-align') || 'left',
        renderHTML: attributes => {
          if (attributes.align === 'left') return {};
          return { 'data-align': attributes.align };
        },
      },
      layout: {
        default: 'single',
        parseHTML: element => element.getAttribute('data-layout') || 'single',
        renderHTML: attributes => {
          if (attributes.layout === 'single') return {};
          return { 'data-layout': attributes.layout };
        }
      }
    };
  },
});
