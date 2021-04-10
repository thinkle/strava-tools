<script>
  export let color = ""; // for bikes
  export let setColorCallback;
  let show = false;
  export let name;
  import { getColors } from "./colors";

  let gridSize = Math.ceil(Math.sqrt(getColors().length));
  let width = "300px";
  let height = 100 + gridSize * 40 + "px";

  let oldColor;

  function hideColorPicker() {
    color = oldColor;
    setColorCallback(oldColor);
    show = false;
  }

  function setColor(newColor) {
    setColorCallback(newColor);
    color = newColor;
  }

  function topLevel(node) {
    document.body.appendChild(node);
  }
</script>

{#if show}
  <div class="modal" use:topLevel style={`--width:${width};--height:${height}`}>
    <slot>
      <h3>
        Change Color {#if name} for {name}{/if}
      </h3>
    </slot>
    <div>
      Custom Color:
      <input
        type="color"
        value={color}
        on:change={(e) => setColor(e.target.value)}
      />
    </div>
    <div class="colorList">
      Pick one:
      <div class="grid" style={`--grid-size:${gridSize}`}>
        {#each getColors() as color}
          <button
            on:click={() => setColor(color)}
            class="colorChooser"
            style={`background-color:${color}`}
          />
        {/each}
      </div>
    </div>
    <div class="buttons">
      <button on:click={hideColorPicker}>Cancel</button>
      <button on:click={() => (show = null)}> Done </button>
    </div>
  </div>
{/if}

<span
  style={`color:${color};--color:${color}`}
  on:click={() => {
    console.log("Show!");
    show = true;
  }}
>
  <slot
    >Choose Color {#if name}for {name}{/if}</slot
  >
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
    width: var(--width);
    height: var(--height);
    position: fixed;
    background-color: white;
    top: calc(50vh - var(--height) / 2);
    left: calc(50vw - var(--width) / 2);
    border: 2px solid #777;
    border-radius: 10px;
    padding: 15px;
    display: flex;
    flex-direction: column;
    z-index: 2;
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
  .colorList button {
    width: 32px;
    height: 32px;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(var(--grid-size), 32px);
    grid-template-rows: repeat(var(--grid-size), 32px);
    grid-column-gap: 8px;
    grid-row-gap: 8px;
    margin: auto;
    width: calc(40px * var(--grid-size));
  }
</style>
