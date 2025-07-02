import React, { useState } from "react";
import { Text, TextInput, View } from "react-native";

const Usernames = () => {
  const [namesir, setName] = useState("Hey");
  return (
    <View>
      <TextInput
        style={{
          height: 40,
          borderColor: 'gray',
          borderWidth: 1,
        }}
        placeholder="Username"
        onChangeText={newText => setName(newText)}
        defaultValue={namesir}
      />
      <Text>
        {"Thank you " + namesir}
      </Text>
    </View>
  );
};

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Usernames/>
    </View>
  );
}
