<script lang="ts">
  interface Props {
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
    value?: string;
    placeholder?: string;
    label?: string;
    error?: string;
    disabled?: boolean;
    required?: boolean;
    onchange?: (e: Event) => void;
  }

  let {
    type = 'text',
    value = $bindable(''),
    placeholder = '',
    label = '',
    error = '',
    disabled = false,
    required = false,
    onchange
  }: Props = $props();
</script>

<div class="input-group">
  {#if label}
    <label class="label">
      {label}
      {#if required}
        <span class="required">*</span>
      {/if}
    </label>
  {/if}

  <input
    {type}
    {placeholder}
    {disabled}
    {required}
    bind:value
    {onchange}
    class="input"
    class:error
  />

  {#if error}
    <span class="error-text">{error}</span>
  {/if}
</div>

<style>
  .input-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .label {
    font-family: var(--font-family);
    font-size: 14px;
    font-weight: 500;
    color: var(--color-foreground);
  }

  .required {
    color: #EF4444;
  }

  .input {
    padding: var(--space-2) var(--space-3);
    font-family: var(--font-family);
    font-size: 16px;
    border: 1px solid #D1D5DB;
    border-radius: var(--radius-md);
    transition: all 0.2s ease;
  }

  .input:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .input.error {
    border-color: #EF4444;
  }

  .input:disabled {
    background-color: #F3F4F6;
    cursor: not-allowed;
  }

  .error-text {
    font-size: 14px;
    color: #EF4444;
  }
</style>
