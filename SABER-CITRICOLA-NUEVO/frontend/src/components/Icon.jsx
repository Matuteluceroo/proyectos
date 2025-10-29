import React from "react";

export function Icon({ as: Component, className = "", ...props }) {
  return React.createElement(Component, {
    className: `icon ${className}`.trim(),
    "aria-hidden": "true",
    ...props,
  });
}