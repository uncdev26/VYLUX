<script lang="ts">
  let nextId = 0;

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

  const inputId = `input-${nextId++}`;
</script>

<div class="input-group">
  {#if label}
    <label class="label" for={inputId}>
      {label}
      {#if required}
        <span class="required">*</span>
      {/if}
    </label>
  {/if}

  <input
    id={inputId}
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
    font-weight: var(--font-weight-label);
    color: var(--color-foreground);
  }

  .required {
    color: var(--color-error);
  }

  .input {
    padding: var(--space-2) var(--space-3);
    font-family: var(--font-family);
    font-size: 16px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    transition: all 0.2s ease;
  }

  .input:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .input.error {
    border-color: var(--color-error);
  }

  .input:disabled {
    background-color: var(--color-disabled);
    cursor: not-allowed;
  }

  .error-text {
    font-size: 14px;
    color: var(--color-error);
  }
</style>
