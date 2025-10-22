import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Flex,
  Box,
  Button,
  Grid,
  Text,
  Input,
  Heading,
  InputGroup,
  InputLeftElement,
  Switch,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon, AddIcon, SearchIcon } from "@chakra-ui/icons";
import { useDisclosure } from "@chakra-ui/react";

import Sidebar from "./componentes/Sidebar";
import CadastroIgreja from "./pages/AuthIgreja";
import ConfirmarCodigo from "./pages/VerificarToken";
import ModalComp from "./componentes/ModalComp";
import SupportButton from "./componentes/SuportButton";
import Dizimos from "./componentes/Dizimos";

// 🔧 Detecta automaticamente se está em localhost ou hospedado
const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://membrocelestial-4.onrender.com"; // ✅ URL do backend Render

const App = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [data, setData] = useState([]);
  const [dataEdit, setDataEdit] = useState({});
  const [search, setSearch] = useState("");
  const [statusMembros, setStatusMembros] = useState({});
  const [idIgreja, setIdIgreja] = useState(() => sessionStorage.getItem("idIgreja") || "");

  const loadUsers = useCallback(async () => {
    if (!idIgreja) {
      setData([]);
      setStatusMembros({});
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/api/users`, {
        headers: { "X-Igreja-Id": idIgreja },
      });
      setData(response.data);

      const statusInicial = response.data.reduce((acc, user) => {
        acc[user._id] = true;
        return acc;
      }, {});
      setStatusMembros(statusInicial);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      setData([]);
    }
  }, [idIgreja]);

  useEffect(() => {
    const atualizarIdIgreja = () => {
      const novoId = sessionStorage.getItem("idIgreja");
      if (novoId !== idIgreja) {
        setIdIgreja(novoId || "");
      }
    };
    window.addEventListener("focus", atualizarIdIgreja);
    return () => window.removeEventListener("focus", atualizarIdIgreja);
  }, [idIgreja]);

  useEffect(() => {
    loadUsers();
  }, [idIgreja, loadUsers]);

  const handleRemove = async (id) => {
    if (!id || !idIgreja) return;
    if (window.confirm("Tem certeza que deseja excluir este usuário?")) {
      try {
        await axios.delete(`${API_URL}/api/users/${id}`, {
          headers: { "X-Igreja-Id": idIgreja },
        });
        loadUsers();
      } catch (error) {
        console.error("Erro ao deletar usuário:", error);
      }
    }
  };

  const handleGenerateLetter = async (id) => {
    if (!idIgreja) return;
    try {
      const response = await axios.get(`${API_URL}/api/users/${id}/carta`, {
        responseType: "blob",
        headers: { "X-Igreja-Id": idIgreja },
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Carta_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erro ao gerar carta", error);
    }
  };

  const toggleStatus = (id) => {
    setStatusMembros((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/cadastro-igreja" />} />
      <Route path="/cadastro-igreja" element={<CadastroIgreja />} />
      <Route path="/confirmar-codigo" element={<ConfirmarCodigo />} />

      <Route
        path="/dashboard"
        element={
          <Flex minH="100vh">
            <Sidebar />
            <Flex flex="1" direction="column" align="center" bg="gray.100">
              <Box bg="blue.500" w="100%" py={4} textAlign="center">
                <Heading color="white">MEMBRO CELESTIAL</Heading>
              </Box>

              <Box w="80%" my={6} p={4} bg="white" borderRadius="md" boxShadow="lg">
                <Flex justify="space-between" mb={4}>
                  <Button
                    leftIcon={<AddIcon />}
                    colorScheme="blue"
                    onClick={() => {
                      setDataEdit({});
                      onOpen();
                    }}
                  >
                    Criar novo Membro
                  </Button>
                  <InputGroup width="300px">
                    <InputLeftElement pointerEvents="none">
                      <SearchIcon color="black" />
                    </InputLeftElement>
                    <Input
                      placeholder="Pesquisar Membro"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </InputGroup>
                </Flex>

                <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                  {data
                    .filter(
                      (user) =>
                        typeof user.nome === "string" &&
                        user.nome.toLowerCase().includes(search.toLowerCase())
                    )
                    .map(({ _id, nome }) => (
                      <Box key={_id} p={4} borderWidth="1px" borderRadius="lg" boxShadow="sm">
                        <Flex justify="space-between" align="center">
                          <Text fontWeight="bold" fontSize="lg">{nome}</Text>
                          <Flex align="center">
                            <Text fontSize="sm" mr={2} fontWeight="bold">
                              {statusMembros[_id] ? "Ativo" : "Inativo"}
                            </Text>
                            <Switch
                              colorScheme="green"
                              isChecked={statusMembros[_id]}
                              onChange={() => toggleStatus(_id)}
                            />
                          </Flex>
                        </Flex>

                        <Flex mt={3} justify="space-between">
                          <Button
                            size="sm"
                            leftIcon={<EditIcon />}
                            colorScheme="yellow"
                            onClick={() => {
                              setDataEdit(data.find((user) => user._id === _id));
                              onOpen();
                            }}
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            leftIcon={<DeleteIcon />}
                            colorScheme="red"
                            onClick={() => handleRemove(_id)}
                          >
                            Excluir
                          </Button>
                        </Flex>

                        <Button
                          size="sm"
                          mt={3}
                          colorScheme="blue"
                          onClick={() => handleGenerateLetter(_id)}
                          width="100%"
                        >
                          Gerar Carta
                        </Button>
                      </Box>
                    ))}
                </Grid>
              </Box>

              <ModalComp
                isOpen={isOpen}
                onClose={onClose}
                dataEdit={dataEdit}
                loadUsers={loadUsers}
                setData={setData}
                data={data}
              />
              <SupportButton />
            </Flex>
          </Flex>
        }
      />

      <Route
        path="/dizimos"
        element={
          <Flex minH="100vh">
            <Sidebar />
            <Flex flex="1" direction="column" align="center" bg="gray.100">
              <Dizimos />
            </Flex>
          </Flex>
        }
      />
    </Routes>
  );
};

export default App;
