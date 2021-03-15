<script>
  export let athlete; // for bikes
  export let colorId;
  import { getBike } from "./bikePicker";
  import { getColorForGear, getColors, setCustomColor } from "./colors";
  export let setColorCallback = (id, newColor, oldColor) => {};
  let color = "";
  $: color = getColorForGear(colorId);
  let oldColor;
  function showColorPicker(id) {
    oldColor = color;
    colorPickerFor = id;
  }
  function hideColorPicker() {
    color = oldColor;
    setGearColor(oldColor);
    colorPickerFor = null;
  }
  let colorPickerFor;

  function setGearColor(newColor) {
    setCustomColor(colorPickerFor, newColor);
    if (setColorCallback) {
      setColorCallback(colorPickerFor, newColor, oldColor);
    }
    color = newColor;
    colorId = colorId;
  }

  function topLevel(node) {
    document.body.appendChild(node);
  }

  let inputRef;
  $: {
    if (inputRef) {
      // delay so it has time to be put in the right
      // spot before we trigger the popup
      setTimeout(() => inputRef.click(), 100);
    }
  }
</script>

{#if colorPickerFor}
  <div class="modal" use:topLevel>
    <span>Change Color for {colorPickerFor}:</span>
    <input
      bind:this={inputRef}
      type="color"
      value={getColorForGear(colorPickerFor)}
      on:change={(e) => setGearColor(e.target.value)}
    />
    <div class="buttons">
      <button on:click={hideColorPicker}>Cancel</button>
      <button on:click={() => colorPickerFor = null}> Done </button>

    </div>
  </div>
{/if}
<span
  style={`color:${color};--color:${color}`}
  on:click={showColorPicker(colorId)}
>
  <slot />
  {(athlete && getBike(colorId, athlete)?.name) || colorId}
</span>

<style>
  span {
    display: inline-flex;
  }
  span::before {
    content: "";
    display: inline-block;
    width: 20px;
    height: 20px;
    margin-right: 5px;
    background-color: var(--color);
    border-radius: 5px;
  }
  .modal {
    width: 300px;
    height: 250px;
    position: fixed;
    background-color: white;
    top: calc(50vh - 200px);
    left: calc(50vw - 200px);
    border: 2px solid #777;
    border-radius: 10px;
    padding: 15px;
    display: flex;
    flex-direction: column;
  }
  .modal .buttons {
    margin-top: auto;
    margin-left: auto;
  }
  input {
    -webkit-appearance: none;
    border: none;
    padding: 2px;
    width: 32px;
    height: 32px;
  }
</style>
