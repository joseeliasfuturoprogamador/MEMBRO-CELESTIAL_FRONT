import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import {
  useEffect,
  useState,
  useCallback,
} from "react";

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
  useDisclosure,
} from "@chakra-ui/react";

import {
  EditIcon,
  DeleteIcon,
  AddIcon,
  SearchIcon,
} from "@chakra-ui/icons";

// COMPONENTES PRINCIPAIS
import Sidebar from "./componentes/Sidebar";
import ModalComp from "./componentes/ModalComp";
import SupportButton from "./componentes/SuportButton";

// AUTENTICAÇÃO
import CadastroIgreja from "./pages/AuthIgreja";
import ConfirmarCodigo from "./pages/VerificarToken";
import RecuperarSenha from "./pages/RecuperarSenha";
import RedefinirSenha from "./pages/RedefinirSenha";

// MÓDULOS DO SISTEMA
import Dizimos from "./componentes/Dizimos";
import Avisos from "./componentes/Avisos";
import Batizados from "./componentes/Batizados";
import Eventos from "./componentes/Eventos";
import CartasCartoes from "./componentes/CartasCartoes";
import Configuracoes from "./componentes/Configuracoes";

// URL DO BACKEND
const API_URL = import.meta.env.VITE_API_URL;

const App = () => {
  const {
    isOpen,
    onOpen,
    onClose,
  } = useDisclosure();

  const [data, setData] = useState([]);

  const [dataEdit, setDataEdit] = useState({});

  const [search, setSearch] = useState("");

  const [statusMembros, setStatusMembros] = useState({});

  // =====================================================
  // ID DA IGREJA
  // =====================================================

  const [idIgreja, setIdIgreja] = useState(
    () =>
      sessionStorage.getItem("idIgreja") || ""
  );

  const toast = useToast();

  // =====================================================
  // CARREGAR MEMBROS
  // =====================================================

  const loadUsers = useCallback(async () => {
    if (!idIgreja) {
      setData([]);
      setStatusMembros({});
      return;
    }

    try {
      const response = await axios.get(
        `${API_URL}/api/users`,
        {
          headers: {
            "X-Igreja-Id": idIgreja,
          },
        }
      );

      const usuarios = Array.isArray(
        response.data
      )
        ? response.data
        : [];

      setData(usuarios);

      const statusInicial =
        usuarios.reduce(
          (acc, user) => {
            acc[user._id] = true;

            return acc;
          },
          {}
        );

      setStatusMembros(statusInicial);
    } catch (error) {
      console.error(
        "Erro ao carregar usuários:",
        error
      );

      toast({
        title:
          "Erro ao carregar usuários",

        description:
          error.response?.data?.message ||
          "Verifique se o servidor está funcionando.",

        status: "error",

        duration: 5000,

        isClosable: true,
      });

      setData([]);
      setStatusMembros({});
    }
  }, [idIgreja, toast]);

  // =====================================================
  // ATUALIZAR ID DA IGREJA
  // =====================================================
  //
  // Esse evento é disparado pelo login depois que
  // o idIgreja é salvo no sessionStorage.
  //
  // Isso evita o problema de o navigate() acontecer
  // antes do React atualizar o estado.
  // =====================================================

  useEffect(() => {
    const atualizarIdIgreja = () => {
      const novoIdIgreja =
        sessionStorage.getItem("idIgreja") || "";

      console.log(
        "Atualizando ID da igreja:",
        novoIdIgreja
      );

      setIdIgreja(novoIdIgreja);
    };

    // Evento disparado após login
    window.addEventListener(
      "igrejaLogada",
      atualizarIdIgreja
    );

    // Atualiza também quando a janela volta ao foco
    window.addEventListener(
      "focus",
      atualizarIdIgreja
    );

    return () => {
      window.removeEventListener(
        "igrejaLogada",
        atualizarIdIgreja
      );

      window.removeEventListener(
        "focus",
        atualizarIdIgreja
      );
    };
  }, []);

  // =====================================================
  // RECARREGAR MEMBROS QUANDO ID DA IGREJA MUDAR
  // =====================================================

  useEffect(() => {
    if (idIgreja) {
      loadUsers();
    } else {
      setData([]);
      setStatusMembros({});
    }
  }, [idIgreja, loadUsers]);

  // =====================================================
  // EXCLUIR MEMBRO
  // =====================================================

  const excluirMembro = async (membroId) => {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este usuário?"
    );

    if (!confirmar) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/api/users/${membroId}`,
        {
          headers: {
            "X-Igreja-Id": idIgreja,
          },
        }
      );

      toast({
        title: "Membro excluído",

        description:
          "O membro foi excluído com sucesso.",

        status: "success",

        duration: 3000,

        isClosable: true,
      });

      await loadUsers();
    } catch (error) {
      console.error(
        "Erro ao excluir membro:",
        error
      );

      toast({
        title: "Erro ao excluir membro",

        description:
          error.response?.data?.message ||
          "Não foi possível excluir o membro.",

        status: "error",

        duration: 5000,

        isClosable: true,
      });
    }
  };

  // =====================================================
  // FILTRAR MEMBROS
  // =====================================================

  const membrosFiltrados = data.filter(
    (user) => {
      if (
        typeof user.nome !== "string"
      ) {
        return false;
      }

      return user.nome
        .toLowerCase()
        .includes(
          search.toLowerCase()
        );
    }
  );

  // =====================================================
  // ROTAS
  // =====================================================

  return (
    <Routes>
      {/* =================================================
          INÍCIO
      ================================================= */}

      <Route
        path="/"
        element={
          idIgreja ? (
            <Navigate
              to="/dashboard"
              replace
            />
          ) : (
            <Navigate
              to="/cadastro-igreja"
              replace
            />
          )
        }
      />

      {/* =================================================
          AUTENTICAÇÃO
      ================================================= */}

      <Route
        path="/cadastro-igreja"
        element={<CadastroIgreja />}
      />

      <Route
        path="/confirmar-codigo"
        element={<ConfirmarCodigo />}
      />

      <Route
        path="/recuperar-senha"
        element={<RecuperarSenha />}
      />

      <Route
        path="/redefinir-senha"
        element={<RedefinirSenha />}
      />

      {/* =================================================
          DASHBOARD
      ================================================= */}

      <Route
        path="/dashboard"
        element={
          idIgreja ? (
            <Flex minH="100vh">
              <Sidebar />

              <Flex
                flex="1"
                direction="column"
                align="center"
                bg="gray.100"
              >
                {/* FRASE */}
                <Box
                  w="100%"
                  py={2}
                  textAlign="center"
                  bg="gray.200"
                >
                  <Text
                    fontSize="sm"
                    color="gray.700"
                    fontWeight="bold"
                    fontStyle="italic"
                  >
                    Mateus 11:28 – “Vinde a mim,
                    todos os que estais cansados
                    e oprimidos, e eu vos aliviarei.”
                  </Text>
                </Box>

                {/* CABEÇALHO */}
                <Box
                  bg="blue.500"
                  w="100%"
                  py={4}
                  textAlign="center"
                >
                  <Heading color="white">
                    MEMBRO CELESTIAL
                  </Heading>
                </Box>

                {/* MEMBROS */}
                <Box
                  w={{
                    base: "95%",
                    md: "90%",
                    lg: "80%",
                  }}
                  my={6}
                  p={4}
                  bg="white"
                  borderRadius="md"
                  boxShadow="lg"
                >
                  <Flex
                    justify="space-between"
                    align="center"
                    gap={4}
                    mb={4}
                    direction={{
                      base: "column",
                      md: "row",
                    }}
                  >
                    <Button
                      leftIcon={<AddIcon />}
                      colorScheme="blue"
                      onClick={() => {
                        setDataEdit({});
                        onOpen();
                      }}
                      w={{
                        base: "100%",
                        md: "auto",
                      }}
                    >
                      Criar novo Membro
                    </Button>

                    <InputGroup
                      width={{
                        base: "100%",
                        md: "300px",
                      }}
                    >
                      <InputLeftElement pointerEvents="none">
                        <SearchIcon color="black" />
                      </InputLeftElement>

                      <Input
                        placeholder="Pesquisar Membro"
                        value={search}
                        onChange={(event) =>
                          setSearch(
                            event.target.value
                          )
                        }
                      />
                    </InputGroup>
                  </Flex>

                  {/* LISTA DE MEMBROS */}
                  <Grid
                    templateColumns={{
                      base: "1fr",
                      md: "repeat(2, 1fr)",
                      lg: "repeat(3, 1fr)",
                    }}
                    gap={4}
                  >
                    {membrosFiltrados.map(
                      ({ _id, nome }) => (
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
                            gap={3}
                            mb={3}
                          >
                            <Text
                              fontWeight="bold"
                              fontSize="lg"
                            >
                              {nome}
                            </Text>

                            <Text
                              fontSize="sm"
                              fontWeight="bold"
                              color={
                                statusMembros[_id]
                                  ? "green.500"
                                  : "red.500"
                              }
                            >
                              {statusMembros[_id]
                                ? "Ativo"
                                : "Inativo"}
                            </Text>
                          </Flex>

                          <Flex
                            justify="space-between"
                            gap={3}
                          >
                            <Button
                              size="sm"
                              leftIcon={
                                <EditIcon />
                              }
                              colorScheme="yellow"
                              onClick={() => {
                                const membroSelecionado =
                                  data.find(
                                    (user) =>
                                      user._id ===
                                      _id
                                  );

                                setDataEdit(
                                  membroSelecionado ||
                                    {}
                                );

                                onOpen();
                              }}
                            >
                              Editar
                            </Button>

                            <Button
                              size="sm"
                              leftIcon={
                                <DeleteIcon />
                              }
                              colorScheme="red"
                              onClick={() =>
                                excluirMembro(
                                  _id
                                )
                              }
                            >
                              Excluir
                            </Button>
                          </Flex>
                        </Box>
                      )
                    )}
                  </Grid>

                  {/* NENHUM MEMBRO */}
                  {membrosFiltrados.length ===
                    0 && (
                    <Box
                      py={8}
                      textAlign="center"
                    >
                      <Text
                        color="gray.500"
                        fontWeight="bold"
                      >
                        Nenhum membro encontrado.
                      </Text>
                    </Box>
                  )}
                </Box>

                {/* AVISOS */}
                <Box
                  w={{
                    base: "95%",
                    md: "90%",
                    lg: "80%",
                  }}
                  my={6}
                >
                  <Avisos />
                </Box>

                {/* MODAL */}
                <ModalComp
                  isOpen={isOpen}
                  onClose={onClose}
                  dataEdit={dataEdit}
                  loadUsers={loadUsers}
                  setData={setData}
                  data={data}
                />

                {/* SUPORTE */}
                <SupportButton />
              </Flex>
            </Flex>
          ) : (
            <Navigate
              to="/cadastro-igreja"
              replace
            />
          )
        }
      />

      {/* =================================================
          DÍZIMOS
      ================================================= */}

      <Route
        path="/dizimos"
        element={
          idIgreja ? (
            <Flex minH="100vh">
              <Sidebar />

              <Flex
                flex="1"
                align="center"
                bg="gray.100"
              >
                <Dizimos />
              </Flex>
            </Flex>
          ) : (
            <Navigate
              to="/cadastro-igreja"
              replace
            />
          )
        }
      />

      {/* =================================================
          EVENTOS
      ================================================= */}

      <Route
        path="/eventos"
        element={
          idIgreja ? (
            <Flex minH="100vh">
              <Sidebar />

              <Flex
                flex="1"
                direction="column"
                align="center"
                bg="gray.100"
              >
                <Eventos />
              </Flex>
            </Flex>
          ) : (
            <Navigate
              to="/cadastro-igreja"
              replace
            />
          )
        }
      />

      {/* =================================================
          BATISMO
      ================================================= */}

      <Route
        path="/batismo"
        element={
          idIgreja ? (
            <Flex minH="100vh">
              <Sidebar />

              <Flex
                flex="1"
                align="center"
                bg="gray.100"
              >
                <Batizados />
              </Flex>
            </Flex>
          ) : (
            <Navigate
              to="/cadastro-igreja"
              replace
            />
          )
        }
      />

      {/* =================================================
          CARTAS E CARTÕES
      ================================================= */}

      <Route
        path="/cartas-cartoes"
        element={
          idIgreja ? (
            <Flex minH="100vh">
              <Sidebar />

              <Flex
                flex="1"
                direction="column"
                bg="gray.100"
                minH="100vh"
              >
                <CartasCartoes />
              </Flex>
            </Flex>
          ) : (
            <Navigate
              to="/cadastro-igreja"
              replace
            />
          )
        }
      />

      {/* =================================================
          CONFIGURAÇÕES
      ================================================= */}

      <Route
        path="/configuracoes"
        element={
          idIgreja ? (
            <Flex minH="100vh">
              <Sidebar />

              <Flex
                flex="1"
                direction="column"
                bg="gray.100"
                minH="100vh"
              >
                <Configuracoes />
              </Flex>
            </Flex>
          ) : (
            <Navigate
              to="/cadastro-igreja"
              replace
            />
          )
        }
      />

      {/* =================================================
          ROTA NÃO ENCONTRADA
      ================================================= */}

      <Route
        path="*"
        element={
          <Navigate
            to={
              idIgreja
                ? "/dashboard"
                : "/cadastro-igreja"
            }
            replace
          />
        }
      />
    </Routes>
  );
};

export default App;