import { useEffect } from "react";

export default function useKeyNavigation(containerRef) {
  useEffect(() => {
    const container = containerRef.current;

    function handleKeyDown(event) {
      if (
        !["ArrowUp", "ArrowDown", "Enter", "Tab", "Escape", " "].includes(
          event.key 
        ) && 
        !["NumpadAdd", "NumpadSubtract"].includes(event.code)
      ) {
        return;
      }

      if (event.key === "Escape") {
        event.target.blur && event.target.blur();
        return;
      }

      const autocompleteOpen = Boolean(
        container.querySelector('.MuiAutocomplete-root[aria-expanded="true"]')
      );
      if (
        ["ArrowUp", "ArrowDown", "Enter"].includes(event.key) &&
        autocompleteOpen
      ) {
        // Don't interrupt navigation within competitor select list.
        return;
      }

      if (
        ["ArrowUp", "ArrowDown"].includes(event.key) ||
        ["NumpadAdd", "NumpadSubtract"].includes(event.code)
        ) {
        // Prevent page scrolling.
        event.preventDefault();
        // Prevent from opening autocomplete popup.
        event.stopPropagation();
      }

      if (
        event.target.tagName === "INPUT" &&
        event.target.dataset.type === "attempt-result"
      ) {
        // Blur the current input first, as it may affect which inputs are disabled.
        event.target.blur();
      }

      if (
        event.key === "Tab" &&
        event.target.dataset.type === "result-select"
      ) {
        // Mimic enter behavior when tab is pressed in the result select.
        event.preventDefault();
        event.stopPropagation();
        event.target.dispatchEvent(
          new KeyboardEvent("keydown", {
            bubbles: true,
            cancelable: true,
            key: "Enter",
          })
        );
        return;
      }

      if (event.key === "Tab") {
        // Let Tab be handled as usually.
        return;
      }

      if (event.key === " ") {
        event.preventDefault();
        const [firstInput] = getInputs(container);
        if (firstInput) {
          focusAndSelect(firstInput);
        }
      }

      // Other event handlers may change which fields are disabled,
      // so let them run first by wrapping the logic in setTimeout(..., 0).
      setTimeout(() => {
        const inputs = getInputs(container);
        const index = inputs.findIndex((input) => event.target === input);
        if (index === -1) return;
        const mod = (n) => (n + inputs.length) % inputs.length;
        if (event.key === "ArrowUp" || event.code === "NumpadSubtract") {
          const previousElement = inputs[mod(index - 1)];
          focusAndSelect(previousElement);
        } else if (
          event.key === "ArrowDown" || event.code === "NumpadAdd" ||
          (event.target.tagName === "INPUT" && event.key === "Enter")
        ) {
          const nextElement = inputs[mod(index + 1)];
          focusAndSelect(nextElement);
        }
      }, 0);
    }

    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [containerRef]);

  useEffect(() => {
    const container = containerRef.current;

    function handleKeyDown(event) {
      if (
        (["ArrowUp", "ArrowDown", "Enter", " "].includes(event.key) ||
        ["NumpadAdd", "NumpadSubtract"].includes(event.code)) &&
        event.target === document.body
      ) {
        // Focus the form if no input is focused and one of the above keys gets pressed.
        event.preventDefault();
        const [firstInput] = getInputs(container);
        if (firstInput) {
          focusAndSelect(firstInput);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [containerRef]);
}

function getInputs(container) {
  return Array.from(container.querySelectorAll("input, button")).filter(
    (input) => !input.disabled
  );
}

function focusAndSelect(element) {
  element.focus();
  element.select && element.select();
}
