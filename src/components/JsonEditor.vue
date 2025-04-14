<template>
  <div class="json-editor">
    <div class="editor-header">
      <h3>{{ title }}</h3>
      <div class="editor-actions">
        <button class="btn btn-sm" @click="formatJson">Format</button>
        <button class="btn btn-primary" @click="$emit('save', editorValue)" :disabled="!isValid">Save</button>
        <button class="btn btn-secondary" @click="$emit('cancel')">Cancel</button>
      </div>
    </div>
    
    <div class="editor-container">
      <textarea
        ref="editor"
        v-model="editorValue"
        class="json-textarea"
        :class="{ 'error': !isValid }"
        @input="validateJson"
        spellcheck="false"
      ></textarea>
    </div>
    
    <div v-if="error" class="error-message">{{ error }}</div>

    <div class="ai-prompt-container">
      <div class="ai-prompt-header">
        <h4>AI Edit Assistant</h4>
      </div>
      <div class="ai-prompt-input">
        <textarea 
          v-model="aiPrompt" 
          placeholder="Describe the changes you want to make to this JSON..."
          class="ai-textarea"
        ></textarea>
        <button class="btn btn-ai" @click="$emit('ai-edit', aiPrompt)" :disabled="!aiPrompt.trim() || isProcessing">
          {{ isProcessing ? 'Processing...' : 'Apply AI Edit' }}
        </button>
      </div>
      <div v-if="aiError" class="error-message">{{ aiError }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'JsonEditor',
  props: {
    value: {
      type: [Object, Array, String],
      required: true
    },
    title: {
      type: String,
      default: 'JSON Editor'
    },
    aiErrorMessage: {
      type: String,
      default: ''
    },
    isProcessing: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      editorValue: '',
      isValid: true,
      error: '',
      aiPrompt: '',
      aiError: ''
    }
  },
  watch: {
    value: {
      handler(newVal) {
        // If the value comes in as an object, stringify it
        if (typeof newVal === 'object') {
          this.editorValue = JSON.stringify(newVal, null, 2)
        } else if (typeof newVal === 'string') {
          this.editorValue = newVal
        }
        this.validateJson()
      },
      immediate: true
    },
    aiErrorMessage(newVal) {
      this.aiError = newVal
    }
  },
  methods: {
    validateJson() {
      try {
        if (this.editorValue.trim()) {
          JSON.parse(this.editorValue)
          this.isValid = true
          this.error = ''
        } else {
          this.isValid = false
          this.error = 'JSON cannot be empty'
        }
      } catch (e) {
        this.isValid = false
        this.error = `Invalid JSON: ${e.message}`
      }
      
      this.$emit('validate', this.isValid)
    },
    formatJson() {
      try {
        const parsed = JSON.parse(this.editorValue)
        this.editorValue = JSON.stringify(parsed, null, 2)
        this.isValid = true
        this.error = ''
      } catch (e) {
        this.error = `Cannot format: ${e.message}`
      }
    }
  }
}
</script>

<style scoped>
.json-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.editor-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.editor-actions {
  display: flex;
  gap: 8px;
}

.editor-container {
  flex-grow: 1;
  min-height: 300px;
}

.json-textarea {
  width: 100%;
  height: 100%;
  min-height: 300px;
  font-family: monospace;
  font-size: 14px;
  padding: 10px;
  border: none;
  resize: none;
  background-color: #1e1e1e;
  color: #d4d4d4;
}

.json-textarea.error {
  border: 1px solid #ff3860;
}

.error-message {
  padding: 8px 15px;
  color: #ff3860;
  background-color: #feecf0;
  font-size: 0.9rem;
}

.ai-prompt-container {
  padding: 15px;
  background-color: #f8f9fa;
  border-top: 1px solid #ddd;
}

.ai-prompt-header {
  margin-bottom: 10px;
}

.ai-prompt-header h4 {
  margin: 0;
  font-size: 1rem;
  color: #333;
}

.ai-prompt-input {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ai-textarea {
  width: 100%;
  min-height: 80px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: system-ui, -apple-system, sans-serif;
}

.btn-ai {
  align-self: flex-end;
  background-color: #6c5ce7;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-ai:hover:not(:disabled) {
  background-color: #5b4bc4;
}

.btn-ai:disabled {
  background-color: #a39ddb;
  cursor: not-allowed;
}
</style> 