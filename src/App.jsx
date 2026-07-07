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
  InputGroup,
  InputLeftElement,
  useToast,
  Heading,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon, AddIcon, SearchIcon } from "@chakra-ui/icons";
import { useDisclosure } from "@chakra-ui/react";

import Sidebar from "./componentes/Sidebar";
import CadastroIgreja from "./pages/AuthIgreja";
import ConfirmarCodigo from "./pages/VerificarToken";
import RecuperarSenha from "./pages/RecuperarSenha";
import RedefinirSenha from "./pages/RedefinirSenha";
import ModalComp from "./componentes/ModalComp";
import SupportButton from "./componentes/SuportButton";

import Dizimos from "./componentes/Dizimos";
import Avisos from "./componentes/Avisos";
import Batizados from "./componentes/Batizados";
import Eventos from "./componentes/Eventos"; // ✅ ADICIONADO

// 🔧 URL do backend
const API_URL = import.meta.env.VITE_API_URL;

const App = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [data, setData] = useState([]);
  const [dataEdit, setDataEdit] = useState({});
  const [search, setSearch] = useState("");
  const [statusMembros, setStatusMembros] = useState({});
  const [idIgreja, setIdIgreja] = useState(
    () => sessionStorage.getItem("idIgreja") || ""
  );
  const toast = useToast();

  // 🔹 Carregar membros
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

      setData(response.data || []);

      const statusInicial =
        response.data?.reduce((acc, user) => {
          acc[user._id] = true;
          return acc;
        }, {}) || {};

      setStatusMembros(statusInicial);
    } catch (error) {
      toast({
        title: "Erro ao carregar usuários",
        description:
          error.response?.data?.message || "Verifique o servidor",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setData([]);
    }
  }, [idIgreja, toast]);

  // 🔹 Atualiza idIgreja ao focar na aba
  useEffect(() => {
    const atualizarIdIgreja = () => {
      const novoId = sessionStorage.getItem("idIgreja") || "";
      if (novoId !== idIgreja) setIdIgreja(novoId);
    };
    window.addEventListener("focus", atualizarIdIgreja);
    return () => window.removeEventListener("focus", atualizarIdIgreja);
  }, [idIgreja]);

  // 🔹 Recarrega membros quando muda igreja
  useEffect(() => {
    if (idIgreja) loadUsers();
  }, [idIgreja, loadUsers]);

  return (
    <Routes>
      {/* 🔥 Redirecionamento inteligente */}
      <Route
        path="/"
        element={
          idIgreja ? (
            <Navigate to="/dashboard" />
          ) : (
            <Navigate to="/cadastro-igreja" />
          )
        }
      />

      {/* 🔐 Auth */}
      <Route path="/cadastro-igreja" element={<CadastroIgreja />} />
      <Route path="/confirmar-codigo" element={<ConfirmarCodigo />} />
      <Route path="/recuperar-senha" element={<RecuperarSenha />} />
      <Route path="/redefinir-senha" element={<RedefinirSenha />} />

      {/* 🧑‍🤝‍🧑 Dashboard (INÍCIO) */}
      <Route
        path="/dashboard"
        element={
          idIgreja ? (
            <Flex minH="100vh">
              <Sidebar />

              <Flex flex="1" direction="column" align="center" bg="gray.100">
                {/* Frase */}
                <Box w="100%" py={2} textAlign="center" bg="gray.200">
                  <Text
                    fontSize="sm"
                    color="gray.700"
                    fontWeight="bold"
                    fontStyle="italic"
                  >
                    Mateus 11:28 – “Vinde a mim, todos os que estais cansados e
                    oprimidos, e eu vos aliviarei.”
                  </Text>
                </Box>

                {/* Título */}
                <Box bg="blue.500" w="100%" py={4} textAlign="center">
                  <Heading color="white">MEMBRO CELESTIAL</Heading>
                </Box>

                {/* Lista de membros */}
                <Box
                  w="80%"
                  my={6}
                  p={4}
                  bg="white"
                  borderRadius="md"
                  boxShadow="lg"
                >
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
                          user.nome
                            .toLowerCase()
                            .includes(search.toLowerCase())
                      )
                      .map(({ _id, nome }) => (
                        <Box
                          key={_id}
                          p={4}
                          borderWidth="1px"
                          borderRadius="lg"
                          boxShadow="sm"
                        >
                          <Flex
                            justify="space-between"
                            align="center"
                            mb={3}
                          >
                            <Text fontWeight="bold" fontSize="lg">
                              {nome}
                            </Text>

                            <Text fontSize="sm" fontWeight="bold">
                              {statusMembros[_id] ? "Ativo" : "Inativo"}
                            </Text>
                          </Flex>

                          <Flex justify="space-between">
                            <Button
                              size="sm"
                              leftIcon={<EditIcon />}
                              colorScheme="yellow"
                              onClick={() => {
                                setDataEdit(
                                  data.find((user) => user._id === _id)
                                );
                                onOpen();
                              }}
                            >
                              Editar
                            </Button>

                            <Button
                              size="sm"
                              leftIcon={<DeleteIcon />}
                              colorScheme="red"
                              onClick={async () => {
                                if (
                                  window.confirm(
                                    "Tem certeza que deseja excluir este usuário?"
                                  )
                                ) {
                                  await axios.delete(
                                    `${API_URL}/api/users/${_id}`,
                                    {
                                      headers: {
                                        "X-Igreja-Id": idIgreja,
                                      },
                                    }
                                  );
                                  loadUsers();
                                }
                              }}
                            >
                              Excluir
                            </Button>
                          </Flex>
                        </Box>
                      ))}
                  </Grid>
                </Box>

                <Box w="80%" my={6}>
                  <Avisos />
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
          ) : (
            <Navigate to="/cadastro-igreja" />
          )
        }
      />

      {/* 💰 Dízimos */}
      <Route
        path="/dizimos"
        element={
          idIgreja ? (
            <Flex minH="100vh">
              <Sidebar />
              <Flex flex="1" align="center" bg="gray.100">
                <Dizimos />
              </Flex>
            </Flex>
          ) : (
            <Navigate to="/cadastro-igreja" />
          )
        }
      />

      {/* 📅 Eventos (NOVO – SEM QUEBRAR NADA) */}
      <Route
        path="/eventos"
        element={
          idIgreja ? (
            <Flex minH="100vh">
              <Sidebar />
              <Flex flex="1" direction="column" align="center" bg="gray.100">
                <Eventos />
              </Flex>
            </Flex>
          ) : (
            <Navigate to="/cadastro-igreja" />
          )
        }
      />

      {/* 💧 Batismos */}
      <Route
        path="/batismo"
        element={
          idIgreja ? (
            <Flex minH="100vh">
              <Sidebar />
              <Flex flex="1" align="center" bg="gray.100">
                <Batizados />
              </Flex>
            </Flex>
          ) : (
            <Navigate to="/cadastro-igreja" />
          )
        }
      />
    </Routes>
  );
};

export default App;