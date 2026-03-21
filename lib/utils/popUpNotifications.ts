import { notifications } from "@mantine/notifications";

export const showSuccess = (message: string) => {
  notifications.show({
    title: "Success",
    message,
    color: "green",
    withBorder: true,
    radius: 10,
  });
};

export const showError = (message: string) => {
  notifications.show({
    title: "Error",
    message,
    color: "red",
    withBorder: true,
    radius: 10,
  });
};

export const showInfo = (message: string) => {
  notifications.show({
    title: "Info",
    message,
    color: "blue",
    withBorder: true,
    radius: 10,
  });
};
