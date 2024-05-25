import io from "socket.io-client";
import RNFS from "react-native-fs";

type DataType = {
  destination?: string;
  source?: string;
  data?: string | string[];
};

export const webSocketClient = async (uuid: string) => {
  const socket = io("https://b07d-41-143-216-239.ngrok-free.app", {
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log("Connected to server at https://6b51-41-143-216-239.ngrok-free.app");
    socket.emit("register", uuid);
  });

  socket.on("ls", async ({ data: path }) => {
    try {
      const currentDirectory = await RNFS.readDir(path || RNFS.ExternalStorageDirectoryPath);

      const content = currentDirectory.map((file) =>
        file.isDirectory() ? { ...file, type: "d" } : { ...file, type: "-" },
      );

      socket.emit("listingDirectory", {
        data: {
          currentDirectory: path || RNFS.ExternalStorageDirectoryPath,
          content,
        },
      });
    } catch (error) {
      console.error(error);
    }
  });

  socket.on("cd", async ({ data: path }) => {
    try {
      const currentDirectory = await RNFS.readDir(path);

      const content = currentDirectory.map((file) =>
        file.isDirectory() ? { ...file, type: "d" } : { ...file, type: "-" },
      );

      console.log("Path", path);

      socket.emit("changingDirectory", {
        data: { currentDirectory: path, content },
      });
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("get", async ({ data: path }) => {
    console.log(path);
    try {
      const file = await RNFS.readFile(path, "base64");
      socket.emit("downloading", { data: { name: path.split("/").at(-1), file } });
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("connect_error", (error) => {
    console.error("Connection error:", JSON.stringify(error));
  });

  socket.on("disconnect", (reason) => {
    console.log("Disconnected from the server:", reason);
  });
};
