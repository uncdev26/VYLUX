<script lang="ts">
  interface Props {
    variant?: 'default' | 'outlined' | 'elevated';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    children: any;
  }

  let {
    variant = 'default',
    padding = 'md',
    children
  }: Props = $props();
</script>

<div class="card card-{variant} card-padding-{padding}">
  {@render children()}
</div>

<style>
  .card {
    background-color: var(--color-background);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }

  .card-default {
    border: 1px solid #E5E7EB;
  }

  .card-outlined {
    border: 2px solid var(--color-primary);
  }

  .card-elevated {
    box-shadow: var(--shadow-lg);
  }

  .card-padding-none {
    padding: 0;
  }

  .card-padding-sm {
    padding: var(--space-3);
  }

  .card-padding-md {
    padding: var(--space-4);
  }

  .card-padding-lg {
    padding: var(--space-6);
  }
</style>
