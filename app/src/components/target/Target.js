import * as ContextMenu from "@radix-ui/react-context-menu";
import { SquarePen, Trash2 } from "lucide-react";

export default function Target({ id, active, params, editTarget, removeTarget }) {
  return (
    <ContextMenu.Root>
      {/* target content */}
      <ContextMenu.Trigger asChild>
        <span
          style={{
            position: "absolute",
            left: params.posX + "vw",
            top: params.posY + "vh",
            minWidth: params.sizeX + "vh",
            minHeight: params.sizeY + "vh",
            // animation: `blink ${1 / (2 * params.freq)}s infinite`,
            animation: `blink ${1 / params.freq}s infinite`,
            border: active ? "2px solid red" : "none",
          }}
        />
      </ContextMenu.Trigger>

      {/* context menu content */}
      <ContextMenu.Portal>
        <ContextMenu.Content className="menu bg-base-200 w-56 rounded-box" sideOffset={5} align="end">
          <ContextMenu.Item onClick={() => editTarget(id, params)} asChild>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <li>
              <a className="w-full flex justify-between">
                Editar Target <SquarePen size={16} />
              </a>
            </li>
          </ContextMenu.Item>

          <ContextMenu.Item onClick={() => removeTarget(id)} asChild>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <li>
              <a className="w-full flex justify-between">
                Remover Target <Trash2 size={16} />
              </a>
            </li>
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
