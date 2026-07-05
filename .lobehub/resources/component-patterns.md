# Component Patterns

## Button

### Sizes
```svelte
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
```

### Variants
```svelte
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>
```

### States
```svelte
<Button disabled>Disabled</Button>
<Button loading>Loading...</Button>
<Button icon={Icon}>With Icon</Button>
```

## Input

### Types
```svelte
<Input type="text" label="Name" />
<Input type="email" label="Email" />
<Input type="password" label="Password" />
<Input type="number" label="Amount" />
<Input type="search" label="Search" />
```

### States
```svelte
<Input error="This field is required" />
<Input disabled />
<Input helperText="Enter your full name" />
```

## Card

### Variants
```svelte
<Card variant="flat">Flat card</Card>
<Card variant="elevated">Elevated card</Card>
<Card variant="outlined">Outlined card</Card>
```

### States
```svelte
<Card hoverable>Hoverable card</Card>
<Card clickable onclick={handler}>Clickable card</Card>
<Card selected>Selected card</Card>
```

## Modal

```svelte
<Modal open={showModal} onclose={closeHandler}>
  <ModalHeader>Title</ModalHeader>
  <ModalBody>Content</ModalBody>
  <ModalFooter>
    <Button variant="secondary" onclick={closeHandler}>Cancel</Button>
    <Button variant="primary" onclick={confirmHandler}>Confirm</Button>
  </ModalFooter>
</Modal>
```

## Form Pattern

```svelte
<form on:submit|preventDefault={handleSubmit}>
  <Input label="Name" bind:value={name} error={errors.name} />
  <Input label="Email" type="email" bind:value={email} error={errors.email} />
  <Button type="submit" loading={submitting}>Submit</Button>
</form>
```
