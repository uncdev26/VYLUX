<script lang="ts">
  let isOpen = $state(false);
  let message = $state('');
  let messages = $state<Array<{ role: string; text: string }>>([]);

  function toggle() {
    isOpen = !isOpen;
  }

  async function sendMessage() {
    if (!message.trim()) return;

    const userMessage = message.trim();
    messages = [...messages, { role: 'user', text: userMessage }];
    message = '';

    // TODO: Connect to LobeHub's IM gateway via WebSocket
    // For now, simulate a response
    setTimeout(() => {
      messages = [...messages, { role: 'assistant', text: `I received: "${userMessage}". Chat integration coming soon!` }];
    }, 1000);
  }
</script>

<div class="fixed bottom-4 right-4 z-50">
  {#if isOpen}
    <div class="w-80 h-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl flex flex-col">
      <div class="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800">
        <span class="font-semibold text-sm">VYLUX Chat</span>
        <button onclick={toggle} class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          &times;
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-3 space-y-2">
        {#each messages as msg}
          <div class="flex" class:justify-end={msg.role === 'user'}>
            <div
              class="max-w-[80%] px-3 py-2 rounded-lg text-sm"
              class:bg-blue-600={msg.role === 'user'}
              class:text-white={msg.role === 'user'}
              class:bg-gray-100={msg.role === 'assistant'}
              class:dark:bg-gray-800={msg.role === 'assistant'}
            >
              {msg.text}
            </div>
          </div>
        {/each}
      </div>

      <form
        onsubmit={(e) => { e.preventDefault(); sendMessage(); }}
        class="p-3 border-t border-gray-200 dark:border-gray-800 flex gap-2"
      >
        <input
          bind:value={message}
          placeholder="Ask VYLUX..."
          class="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          class="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  {:else}
    <button
      onclick={toggle}
      class="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    </button>
  {/if}
</div>
