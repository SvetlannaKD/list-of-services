import { useMemo, useState } from "react";
import "./App.css";
// import React from "react"; // ненужный импорт

interface Service {
  id: number;
  name: string;
  price: number;
}

interface ServiceItem {
  service: Service;
  quantity: number;
}

const availableServices: Service[] = [
  { id: 1, name: "Разработка лендинга", price: 50000 },
  { id: 2, name: "Интернет-магазин", price: 150000 },
  { id: 3, name: "Корпоративный портал", price: 300000 },
  { id: 4, name: "SEO-оптимизация", price: 20000 },
];

function App() {

  // Не правильное хранение состояния (let selectedServiceId, let selectedServices, let quantity)
  // 1) изменение состояния в let не будет тригиреть перерендер компонента, мы не увидим новые изменения на странице (из-за этого были баги, не выбиралась, не добавлялась услуга,
  // не изменялось кол-во услуг в инпуте при добавлении)
  // 2) если компонент перерендериться, все значения в let будут созданы заново
  // Состояние нужно хранить в useState, либо в стейт менеджере
  // let selectedServices: ServiceItem[] = [];
  const [selectedServices, setSelectedServices] = useState<ServiceItem[]>([]);
  // let selectedServiceId: number | string = "";
  const [selectedServiceId, setSelectedServiceId] = useState<number | string>(
    "",
  );
  // let quantity: number = 1;
  const [quantity, setQuantity] = useState<number>(1);

  // let totalPrice = 0;
  // for (const item of selectedServices) {
  //   totalPrice += item.service.price * item.quantity;
  // }
  // Хранение итоговой суммы в let бага не создает, но при любом перерндере начинает пересчитывать заново (не оптимизировано)
  // Чтобы пересчитывалось только при изменении списка, сумму нужно хранить в useMemo()
  const totalPrice = useMemo(() => {
    return selectedServices.reduce(
      (total, item) => total + item.service.price * item.quantity,
      0,
    );
  }, [selectedServices]);

  function addService() {
    const service = availableServices.find((s) => s.id === selectedServiceId);
    if (!service) return;

    // existing.quantity += quantity;
    // selectedServices.push({ service, quantity });
    // Мутация массива, объекта не будет тригерить перерендер (из-за этого был баг, не добавлялась услуга, кол-во услуги)
    // Нужен иммутабельный подход, массив и объект нужно создавать новый
    setSelectedServices((prev) => {
      const existing = selectedServices.find(
        (item) => item.service === service,
      );

      if (existing) {
        return selectedServices.map((selectedServic) => {
          if (selectedServic.service.id === existing.service.id) {
            return {
              ...selectedServic,
              quantity: selectedServic.quantity + quantity,
            };
          } else {
            return selectedServic;
          }
        });
      }

      return [...prev, { service, quantity }];
    });
  }

  function removeService(item: ServiceItem) {
    // const index = selectedServices.indexOf(item);
    // if (index > -1) {
    //   // selectedServices.splice(index, 1);
    // }

    // selectedServices.splice(index, 1);
    // Мутация массива не будет тригерить перерендер (из-за этого был баг, не удалялась услуга)
    // Нужен иммутабельный подход, массив нужно создавать новый
    setSelectedServices((prev) =>
      prev.filter((prevItem) => prevItem.service.id !== item.service.id),
    );
  }

  return (
    <div
      className="project-builder"
      style={{ maxWidth: 700, margin: "0 auto", fontFamily: "sans-serif" }}
    >
      <h2>Состав проекта</h2>

      <div
        className="add-service"
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 24,
          alignItems: "center",
        }}
      >
        <select
          style={{ padding: "2px 12px" }}
          value={selectedServiceId}
          onChange={(e) => {
            // selectedServiceId = Number(e.target.value);
            // Мутация значения не будет тригерить перерендер (из-за этого был баг, не выбиралась услуга)
            // Нужен иммутабельный подход, значение нужно создавать новое
            setSelectedServiceId(Number(e.target.value));
          }}
        >
          <option value="" disabled>
            Выберите услугу
          </option>
          {availableServices.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} — {service.price.toLocaleString()} ₽
            </option>
          ))}
        </select>

        <input
          type="number"
          min={1}
          max={10}
          value={quantity}
          onChange={(e) => {
            // Нет валидации, min={1} и max={10} не гарантирует, что пользователь можжет ввести кол-во только в этом диапазоне, и это число будет целым
            // (был баг, добавлялась услуга с нулевым кол-вом и кол-вом больше 10, а также не целые числа)
            // Нужно валидировать инпут
            if (!Number.isInteger(Number(e.target.value)) || Number(e.target.value) < 1 || Number(e.target.value) > 10){
              return;
            }
            // quantity = Number(e.target.value);
            // Мутация значения не будет тригерить перерендер (из-за этого был баг, не изменялось кол-во услуг)
            // Нужен иммутабельный подход, значение нужно создавать новое
            setQuantity(Number(e.target.value));
            
          }}
          style={{ width: 80, padding: "2px 12px" }}
        />

        <button onClick={addService} disabled={!selectedServiceId}>
          Добавить
        </button>
      </div>

      {selectedServices.length > 0 ? (
        <table
          className="services-table"
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: 10,
                  textAlign: "left",
                }}
              >
                Услуга
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: 10,
                  textAlign: "left",
                }}
              >
                Цена за ед.
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: 10,
                  textAlign: "left",
                }}
              >
                Кол-во
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: 10,
                  textAlign: "left",
                }}
              >
                Сумма
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: 10,
                  textAlign: "left",
                }}
              ></th>
            </tr>
          </thead>
          <tbody>
            {selectedServices.map((item) => (
              <tr key={item.service.id}>
                <td style={{ border: "1px solid #ddd", padding: 10 }}>
                  {item.service.name}
                </td>
                <td style={{ border: "1px solid #ddd", padding: 10 }}>
                  {item.service.price.toLocaleString()} ₽
                </td>
                <td style={{ border: "1px solid #ddd", padding: 10 }}>
                  {item.quantity}
                </td>
                <td style={{ border: "1px solid #ddd", padding: 10 }}>
                  {(item.service.price * item.quantity).toLocaleString()} ₽
                </td>
                <td style={{ border: "1px solid #ddd", padding: 10 }}>
                  <button onClick={() => removeService(item)}>Удалить</button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} style={{ border: "1px solid #ddd", padding: 10 }}>
                <strong>Итого:</strong>
              </td>
              <td colSpan={2} style={{ border: "1px solid #ddd", padding: 10 }}>
                <strong>{totalPrice.toLocaleString()} ₽</strong>
              </td>
            </tr>
          </tfoot>
        </table>
      ) : (
        <p style={{ color: "#888", fontStyle: "italic" }}>
          Пока не добавлено ни одной услуги
        </p>
      )}
    </div>
  );
}

export default App;
