<script>
  import ColorPicker from "./ColorPicker.svelte";

  export let athlete; // for bikes
  export let colorId;
  import { getBike } from "./bikePicker";
  import { getColorForGear, getColors, setCustomColor } from "./colors";
  export let onSetGearColor = (id, newColor, oldColor) => {};

  let color = "";
  let oldColor = color;
  $: {
    color = getColorForGear(colorId);
    oldColor = color;
  }
  let colorPickerFor;
  $: colorPickerFor = getBike(colorId, athlete)?.name || colorId;

  function setColorCallback(newColor) {
    setCustomColor(colorId, newColor);
    if (onSetGearColor) {
      onSetGearColor(colorId, newColor, oldColor);
    }
    color = newColor;
    colorId = colorId;
  }
</script>

<ColorPicker {color} name={colorPickerFor} {setColorCallback}>
  {colorPickerFor}
</ColorPicker>

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
