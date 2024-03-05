import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  Button,
} from "react-native";
import * as SQLite from "expo-sqlite";
import React, { useState, useEffect } from "react";

export default function App() {
  const [id, setId] = useState("");
  const [product, setProduct] = useState("");
  const [amount, setAmount] = useState("");
  const [list, setList] = useState([]);
  const db = SQLite.openDatabase("shoppinglist.db");

  useEffect(() => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          "create table if not exists shoppinglist (id integer primary key not null, product text, amount text);"
        );
      },
      () => console.error("Error when creating DB"),
      updateList
    );
  }, []);

  const saveItem = () => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          "insert into shoppinglist (product, amount) values (?, ?);",
          [product, parseInt(amount)]
        );
      },
      null,
      updateList
    );
  };

  const updateList = () => {
    db.transaction(
      (tx) => {
        tx.executeSql("select * from shoppinglist;", [], (_, { rows }) =>
          setList(rows._array)
        );
      },
      null,
      null
    );
  };

  const deleteItem = (id) => {
    db.transaction(
      (tx) => {
        tx.executeSql("delete from shoppinglist where id = ?;", [id]);
      },
      null,
      updateList
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Product"
        onChangeText={(product) => setProduct(product)}
        value={product}
      />
      <TextInput
        placeholder="Amount"
        onChangeText={(amount) => setAmount(amount)}
        value={amount}
      />
      <Button onPress={saveItem} title="Save" />
      <FlatList
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.productText}>
              {item.product}, {item.amount}
            </Text>
            <Text style={styles.boughtText} onPress={() => deleteItem(item.id)}>
              Bought
            </Text>
          </View>
        )}
        data={list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 100,
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  productText: {
    fontSize: 16,
    color: "black",
  },
  boughtText: {
    fontSize: 16,
    color: "blue",
  },
});
