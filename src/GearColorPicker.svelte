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
