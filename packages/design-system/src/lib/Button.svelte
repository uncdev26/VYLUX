<script lang="ts">
  interface Props {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    onclick?: () => void;
    children: any;
  }

  let {
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    onclick,
    children
  }: Props = $props();
</script>

<button
  class="btn btn-{variant} btn-{size}"
  {disabled}
  {onclick}
>
  {#if loading}
    <span class="spinner"></span>
  {/if}
  {@render children()}
</button>

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    font-family: var(--font-family);
    font-weight: var(--font-weight-body);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-primary {
    background-color: var(--color-primary);
    color: white;
    border: none;
  }

  .btn-secondary {
    background-color: var(--color-secondary);
    color: white;
    border: none;
  }

  .btn-outline {
    background-color: transparent;
    color: var(--color-primary);
    border: 1px solid var(--color-primary);
  }

  .btn-ghost {
    background-color: transparent;
    color: var(--color-foreground);
    border: none;
  }

  .btn-sm {
    padding: var(--space-1) var(--space-3);
    font-size: 14px;
  }

  .btn-md {
    padding: var(--space-2) var(--space-4);
    font-size: 16px;
  }

  .btn-lg {
    padding: var(--space-3) var(--space-6);
    font-size: 18px;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top-color: currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
