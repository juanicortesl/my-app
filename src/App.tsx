import React from "react";
import INDICES_DATA from "./indices_data";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import axios from "axios";
import Plot from "react-plotly.js";
import "./App.css";

// consts
const API_URL = "https://mindicador.cl/api";
const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];
const CURRENT_YEAR = new Date().getFullYear();
interface IData {
  serie: any[];
  nombre: string;
  unidad_medida: string;
}
function App() {
  const [data, setData] = React.useState<IData>({
    serie: [],
    nombre: "",
    unidad_medida: "",
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [yearRange, setYearRange] = React.useState([CURRENT_YEAR]);
  const [selectedIndex, setSelectedIndex] = React.useState("");
  const [selectedYear, setSelectedYear] = React.useState(CURRENT_YEAR);
  const [selectedMonth, setSelectedMonth] = React.useState(0);

  const changeIndex = (index: string) => {
    setSelectedIndex(index);
    let start_year = INDICES_DATA[index].start_year;
    const new_year_range = [];
    for (let i = start_year; i <= CURRENT_YEAR; i++) {
      new_year_range.push(i);
    }
    setYearRange(new_year_range);
    if (new_year_range.includes(selectedYear)) {
      setSelectedYear(selectedYear);
    }
  };

  const changeYear = (year: number) => {
    setSelectedYear(year);
  };

  const changeMonth = (month: number) => {
    setSelectedMonth(month);
  };

  const getData = () => {
    setLoading(true);
    setError(false);
    axios
      .get(`${API_URL}/${selectedIndex}/${selectedYear}`)
      .then((response) => {
        // filter by month
        const filtered_data = response.data.serie.filter(
          (item: any) => new Date(item.fecha).getMonth() === selectedMonth
        );
        setData({
          serie: filtered_data,
          nombre: response.data.nombre,
          unidad_medida: response.data.unidad_medida,
        });
        console.log(response.data, "DATA");
        setLoading(false);
      })
      .catch((error) => {
        console.log(error, "error");
        setLoading(false);
        setError(true);
      });
  };

  React.useEffect(() => {
    if (selectedIndex && selectedYear && selectedMonth >= 0) {
      getData();
    }
  }, [selectedIndex, selectedYear, selectedMonth]);

  return (
    <div className="App">
      <Container>
        <Row>
          <Col>
            <h1>Indicadores financieros</h1>
          </Col>
        </Row>
        <Row>
          <Col md="auto">
            <Row>
              <p>Indicador</p>
            </Row>
            <Form.Select
              aria-label="Default select example"
              size="lg"
              value={selectedIndex}
              onChange={(e) => changeIndex(e.target.value)}
              style={{ width: "200px" }}
            >
              <option value={""}>Indicador</option>
              {Object.keys(INDICES_DATA).map((value, index) => (
                <option key={index} value={value}>
                  {value}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md="auto">
            <Row>
              <p>Año</p>
            </Row>
            <Form.Select
              aria-label="Default select example"
              size="lg"
              value={selectedYear}
              onChange={(e) => changeYear(parseInt(e.target.value))}
              style={{ width: "200px" }}
            >
              <option value={0}>Año</option>
              {yearRange.map((value, index) => (
                <option key={index} value={value}>
                  {value}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md="auto">
            <Row>
              <p>Mes</p>
            </Row>
            <Form.Select
              aria-label="Default select example"
              size="lg"
              value={selectedMonth}
              onChange={(e) => changeMonth(parseInt(e.target.value))}
              style={{ width: "200px" }}
            >
              <option value={-1}>Mes</option>
              {MONTHS.map((value, index) => (
                <option key={index} value={index}>
                  {value}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>
        {selectedIndex && selectedYear && selectedMonth >= 0 && (
          <Row>
            <Col>
              {loading ? (
                <Spinner animation="border" role="status">
                  <span className="sr-only">Loading...</span>
                </Spinner>
              ) : (
                <div>
                  {error ? (
                    <p>Ha ocurrido un error</p>
                  ) : (
                    <div>
                      {data.serie.length > 0 ? (
                        <Plot
                          data={[
                            {
                              x: data.serie.map((value) => value.fecha),
                              y: data.serie.map((value) => value.valor),
                              type: "scatter",
                              mode: "lines+markers",
                              marker: { color: "blue" },
                            },
                          ]}
                          layout={{
                            width: 800,
                            height: 600,
                            title: `${data.nombre} de ${MONTHS[selectedMonth]} de ${selectedYear}`,
                            yaxis: {
                              title: `Valor en ${data.unidad_medida}`,
                            },
                          }}
                        />
                      ) : (
                        <div>No hay datos para este mes</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
}

export default App;
