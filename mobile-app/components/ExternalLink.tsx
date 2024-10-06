import { Link } from "expo-router";
import { openBrowserAsync } from "expo-web-browser";
import { ReactElement, type ComponentProps } from "react";
import { GestureResponderEvent, Platform } from "react-native";

type Props = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

export function ExternalLink({ href, ...rest }: Props): ReactElement {
  return (
    <Link
      target="_blank"
      {...rest}
      href={href}
      onPress={async (
        event: GestureResponderEvent | React.MouseEvent<HTMLAnchorElement, MouseEvent>
      ): Promise<void> => {
        if (Platform.OS !== "web") {
          event.preventDefault();
          await openBrowserAsync(href);
        }
      }}
    />
  );
}
