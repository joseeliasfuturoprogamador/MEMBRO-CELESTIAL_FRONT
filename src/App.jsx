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

  // ID DA IGREJA
  const [idIgreja, setIdIgreja] = useState(
    () => sessionStorage.getItem("idIgreja") || ""
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

      const usuarios = Array.isArray(response.data)
        ? response.data
        : [];

      setData(usuarios);

      const statusInicial = usuarios.reduce(
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
        title: "Erro ao carregar usuários",
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
  // ATUALIZAR ID DA IGREJA APÓS LOGIN
  // =====================================================

  useEffect(() => {
    const atualizarIdIgreja = () => {
      const novoIdIgreja =
        sessionStorage.getItem("idIgreja") || "";

      console.log(
        "ID da igreja atualizado:",
        novoIdIgreja
      );

      setIdIgreja(novoIdIgreja);
    };

    window.addEventListener(
      "igrejaLogada",
      atualizarIdIgreja
    );

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
  // RECARREGAR MEMBROS QUANDO O ID DA IGREJA MUDAR
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

  const membrosFiltrados = data.filter((user) => {
    if (typeof user.nome !== "string") {
      return false;
    }

    return user.nome
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  // =====================================================
  // LAYOUT PRINCIPAL DO SISTEMA
  // =====================================================

  const LayoutInterno = ({
    children,
    mostrarSuporte = true,
    centralizar = false,
  }) => {
    return (
      <Flex minH="100vh" w="100%">
        <Sidebar />

        <Flex
          flex="1"
          ml={{
            base: 0,
            md: "220px",
          }}
          minW={0}
          minH="100vh"
          direction="column"
          bg="gray.100"
          align={centralizar ? "center" : "stretch"}
        >
          {children}

          {mostrarSuporte && <SupportButton />}
        </Flex>
      </Flex>
    );
  };

  // =====================================================
  // FRASE BÍBLICA
  // =====================================================

  const FraseBiblica = () => {
    return (
      <Box
        w="100%"
        px={{
          base: 3,
          sm: 4,
          md: 6,
        }}
        pt={{
          base: 3,
          md: 4,
        }}
        pb={{
          base: 2,
          md: 3,
        }}
        bg="gray.100"
      >
        <Box
          w="100%"
          maxW="1400px"
          mx="auto"
          bg="white"
          borderRadius={{
            base: "lg",
            md: "xl",
          }}
          px={{
            base: 4,
            sm: 5,
            md: 8,
          }}
          py={{
            base: 4,
            md: 5,
          }}
          boxShadow="sm"
          borderLeftWidth="5px"
          borderLeftColor="blue.500"
          position="relative"
          overflow="hidden"
        >
          <Box
            position="absolute"
            top="-20px"
            right="-20px"
            w="80px"
            h="80px"
            borderRadius="full"
            bg="blue.50"
          />

          <Text
            position="relative"
            fontSize={{
              base: "md",
              sm: "lg",
              md: "xl",
            }}
            lineHeight="1.6"
            color="gray.700"
            fontWeight="medium"
            fontStyle="italic"
            textAlign={{
              base: "center",
              md: "left",
            }}
          >
            “Vinde a mim, todos os que estais cansados
            e oprimidos, e eu vos aliviarei.”
          </Text>

          <Text
            position="relative"
            mt={2}
            fontSize={{
              base: "xs",
              md: "sm",
            }}
            fontWeight="bold"
            color="blue.600"
            textAlign={{
              base: "center",
              md: "left",
            }}
          >
            Mateus 11:28
          </Text>
        </Box>
      </Box>
    );
  };

  // =====================================================
  // ROTAS
  // =====================================================

  return (
    <Routes>

      {/* ================================================= */}
      {/* ROTA INICIAL */}
      {/* ================================================= */}

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

      {/* ================================================= */}
      {/* AUTENTICAÇÃO */}
      {/* ================================================= */}

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

      {/* ================================================= */}
      {/* DASHBOARD */}
      {/* ================================================= */}

      <Route
        path="/dashboard"
        element={
          idIgreja ? (
            <LayoutInterno>

              {/* ============================== */}
              {/* FRASE BÍBLICA - TOPO */}
              {/* ============================== */}

              <FraseBiblica />

              {/* ============================== */}
              {/* TÍTULO */}
              {/* ============================== */}

              <Box
                bg="blue.500"
                w="100%"
                px={4}
                py={{
                  base: 5,
                  md: 6,
                }}
                textAlign="center"
                boxShadow="sm"
              >
                <Heading
                  color="white"
                  fontSize={{
                    base: "2xl",
                    sm: "3xl",
                    md: "4xl",
                  }}
                  letterSpacing="wide"
                >
                  MEMBRO CELESTIAL
                </Heading>

                <Text
                  color="whiteAlpha.900"
                  mt={1}
                  fontSize={{
                    base: "xs",
                    md: "sm",
                  }}
                >
                  Gestão completa para sua igreja
                </Text>
              </Box>

              {/* ============================== */}
              {/* LISTA DE MEMBROS */}
              {/* ============================== */}

              <Box
                w={{
                  base: "calc(100% - 24px)",
                  sm: "94%",
                  md: "90%",
                  lg: "85%",
                  xl: "80%",
                }}
                maxW="1400px"
                mx="auto"
                my={{
                  base: 4,
                  md: 6,
                }}
                p={{
                  base: 3,
                  sm: 4,
                  md: 6,
                }}
                bg="white"
                borderRadius="xl"
                boxShadow="lg"
              >

                {/* CABEÇALHO DA LISTA */}

                <Flex
                  justify="space-between"
                  align={{
                    base: "stretch",
                    md: "center",
                  }}
                  gap={4}
                  mb={5}
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
                    minH="46px"
                  >
                    Criar novo Membro
                  </Button>

                  <InputGroup
                    w={{
                      base: "100%",
                      md: "320px",
                    }}
                  >
                    <InputLeftElement
                      pointerEvents="none"
                      h="100%"
                    >
                      <SearchIcon color="gray.500" />
                    </InputLeftElement>

                    <Input
                      h="46px"
                      placeholder="Pesquisar Membro"
                      value={search}
                      onChange={(event) =>
                        setSearch(event.target.value)
                      }
                      borderRadius="md"
                    />
                  </InputGroup>

                </Flex>

                {/* GRID DE MEMBROS */}

                <Grid
                  templateColumns={{
                    base: "1fr",
                    sm: "repeat(2, 1fr)",
                    lg: "repeat(3, 1fr)",
                  }}
                  gap={{
                    base: 3,
                    md: 4,
                  }}
                >

                  {membrosFiltrados.map(
                    ({
                      _id,
                      nome,
                    }) => (

                      <Box
                        key={_id}
                        p={{
                          base: 4,
                          md: 5,
                        }}
                        borderWidth="1px"
                        borderColor="gray.200"
                        borderRadius="lg"
                        boxShadow="sm"
                        transition="all 0.2s"
                        _hover={{
                          boxShadow: "md",
                          transform: "translateY(-2px)",
                        }}
                        minW={0}
                      >

                        {/* NOME E STATUS */}

                        <Flex
                          justify="space-between"
                          align="flex-start"
                          gap={3}
                          mb={4}
                        >

                          <Text
                            fontWeight="bold"
                            fontSize={{
                              base: "md",
                              md: "lg",
                            }}
                            color="gray.700"
                            minW={0}
                            wordBreak="break-word"
                          >
                            {nome}
                          </Text>

                          <Text
                            flexShrink={0}
                            fontSize="xs"
                            fontWeight="bold"
                            color={
                              statusMembros[_id]
                                ? "green.500"
                                : "red.500"
                            }
                            bg={
                              statusMembros[_id]
                                ? "green.50"
                                : "red.50"
                            }
                            px={2}
                            py={1}
                            borderRadius="full"
                          >
                            {statusMembros[_id]
                              ? "Ativo"
                              : "Inativo"}
                          </Text>

                        </Flex>

                        {/* BOTÕES */}

                        <Flex
                          gap={2}
                          direction={{
                            base: "column",
                            sm: "row",
                          }}
                        >

                          <Button
                            size="sm"
                            leftIcon={<EditIcon />}
                            colorScheme="yellow"
                            onClick={() => {

                              const membroSelecionado =
                                data.find(
                                  (user) =>
                                    user._id === _id
                                );

                              setDataEdit(
                                membroSelecionado || {}
                              );

                              onOpen();
                            }}
                            w={{
                              base: "100%",
                              sm: "auto",
                            }}
                            minH="40px"
                          >
                            Editar
                          </Button>

                          <Button
                            size="sm"
                            leftIcon={<DeleteIcon />}
                            colorScheme="red"
                            onClick={() =>
                              excluirMembro(_id)
                            }
                            w={{
                              base: "100%",
                              sm: "auto",
                            }}
                            minH="40px"
                          >
                            Excluir
                          </Button>

                        </Flex>

                      </Box>
                    )
                  )}

                </Grid>

                {/* NENHUM MEMBRO */}

                {membrosFiltrados.length === 0 && (
                  <Box
                    py={{
                      base: 8,
                      md: 10,
                    }}
                    textAlign="center"
                  >
                    <Text
                      color="gray.500"
                      fontWeight="bold"
                      fontSize={{
                        base: "sm",
                        md: "md",
                      }}
                    >
                      Nenhum membro encontrado.
                    </Text>
                  </Box>
                )}

              </Box>

              {/* ============================== */}
              {/* AVISOS */}
              {/* ============================== */}

              <Box
                w={{
                  base: "calc(100% - 24px)",
                  sm: "94%",
                  md: "90%",
                  lg: "85%",
                  xl: "80%",
                }}
                maxW="1400px"
                mx="auto"
                mb={{
                  base: 6,
                  md: 8,
                }}
              >
                <Avisos />
              </Box>

              {/* ============================== */}
              {/* MODAL */}
              {/* ============================== */}

              <ModalComp
                isOpen={isOpen}
                onClose={onClose}
                dataEdit={dataEdit}
                loadUsers={loadUsers}
                setData={setData}
                data={data}
              />

            </LayoutInterno>
          ) : (
            <Navigate
              to="/cadastro-igreja"
              replace
            />
          )
        }
      />

      {/* ================================================= */}
      {/* DÍZIMOS */}
      {/* ================================================= */}

      <Route
        path="/dizimos"
        element={
          idIgreja ? (
            <LayoutInterno>
              <Dizimos />
            </LayoutInterno>
          ) : (
            <Navigate
              to="/cadastro-igreja"
              replace
            />
          )
        }
      />

      {/* ================================================= */}
      {/* EVENTOS */}
      {/* ================================================= */}

      <Route
        path="/eventos"
        element={
          idIgreja ? (
            <LayoutInterno>
              <Eventos />
            </LayoutInterno>
          ) : (
            <Navigate
              to="/cadastro-igreja"
              replace
            />
          )
        }
      />

      {/* ================================================= */}
      {/* BATISMO */}
      {/* ================================================= */}

      <Route
        path="/batismo"
        element={
          idIgreja ? (
            <LayoutInterno>
              <Batizados />
            </LayoutInterno>
          ) : (
            <Navigate
              to="/cadastro-igreja"
              replace
            />
          )
        }
      />

      {/* ================================================= */}
      {/* CARTAS E CARTÕES */}
      {/* ================================================= */}

      <Route
        path="/cartas-cartoes"
        element={
          idIgreja ? (
            <LayoutInterno>
              <CartasCartoes />
            </LayoutInterno>
          ) : (
            <Navigate
              to="/cadastro-igreja"
              replace
            />
          )
        }
      />

      {/* ================================================= */}
      {/* CONFIGURAÇÕES */}
      {/* ================================================= */}

      <Route
        path="/configuracoes"
        element={
          idIgreja ? (
            <LayoutInterno>
              <Configuracoes />
            </LayoutInterno>
          ) : (
            <Navigate
              to="/cadastro-igreja"
              replace
            />
          )
        }
      />

      {/* ================================================= */}
      {/* ROTA INEXISTENTE */}
      {/* ================================================= */}

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