<script lang="ts">
  interface Props {
    formId: string;
    fields?: Array<{
      name: string;
      label: string;
      type: string;
      required?: boolean;
    }>;
  }

  let { formId, fields = [] }: Props = $props();

  let formData = $state<Record<string, string>>({});
  let isSubmitting = $state(false);
  let submitted = $state(false);
  let error = $state('');

  function handleSubmit() {
    isSubmitting = true;
    error = '';

    // TODO: Submit to CMS via API endpoint
    // For now, simulate submission
    setTimeout(() => {
      isSubmitting = false;
      submitted = true;
    }, 1000);
  }
</script>

{#if submitted}
  <div class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
    <p class="text-green-700 dark:text-green-300 font-medium">Thank you! Your submission has been received.</p>
  </div>
{:else}
  <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4">
    {#each fields as field}
      <div>
        <label for={field.name} class="block text-sm font-medium mb-1">
          {field.label}
          {#if field.required}<span class="text-red-500">*</span>{/if}
        </label>

        {#if field.type === 'textarea'}
          <textarea
            id={field.name}
            bind:value={formData[field.name]}
            required={field.required}
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        {:else}
          <input
            type={field.type}
            id={field.name}
            bind:value={formData[field.name]}
            required={field.required}
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        {/if}
      </div>
    {/each}

    {#if error}
      <p class="text-red-500 text-sm">{error}</p>
    {/if}

    <button
      type="submit"
      disabled={isSubmitting}
      class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
    >
      {isSubmitting ? 'Submitting...' : 'Submit'}
    </button>
  </form>
{/if}
