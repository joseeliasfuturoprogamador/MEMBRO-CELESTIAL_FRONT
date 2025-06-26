import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
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

// Componentes
import Sidebar from "./componentes/Sidebar";
import CadastroIgreja from "./pages/AuthIgreja";
import ConfirmarCodigo from "./pages/VerificarToken";
import ModalComp from "./componentes/ModalComp";
import SupportButton from "./componentes/SuportButton";

const App = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [data, setData] = useState([]);
  const [dataEdit, setDataEdit] = useState({});
  const [search, setSearch] = useState("");
  const [statusMembros, setStatusMembros] = useState({});

  const loadUsers = async () => {
    const idIgreja = localStorage.getItem("idIgreja");
    if (!idIgreja) return;

    try {
      const response = await axios.get("http://localhost:3000/api/users", {
        headers: {
          "X-Igreja-Id": idIgreja,
        },
      });
      setData(response.data);

      const statusInicial = response.data.reduce((acc, user) => {
        acc[user._id] = true;
        return acc;
      }, {});
      setStatusMembros(statusInicial);
    } catch (error) {
      console.error("Erro ao carregar usuários", error);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRemove = async (id) => {
    const idIgreja = localStorage.getItem("idIgreja");
    if (!id || !idIgreja) {
      alert("Informações incompletas para deletar o usuário.");
      return;
    }

    if (window.confirm("Tem certeza que deseja excluir este usuário?")) {
      try {
        await axios.delete(`http://localhost:3000/api/users/${id}`, {
          headers: {
            "X-Igreja-Id": idIgreja,
          },
        });

        setData((prevData) => prevData.filter((user) => user._id !== id));
        setStatusMembros((prevStatus) => {
          const novoStatus = { ...prevStatus };
          delete novoStatus[id];
          return novoStatus;
        });

        alert("Usuário excluído com sucesso!");
      } catch (error) {
        console.error("Erro ao deletar usuário:", error);
        alert("Erro ao deletar usuário. Verifique a conexão ou tente novamente.");
      }
    }
  };

  const handleGenerateLetter = async (id) => {
    const idIgreja = localStorage.getItem("idIgreja");
    if (!idIgreja) {
      alert("Igreja não identificada. Faça login novamente.");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:3000/api/users/${id}/carta`,
        {
          responseType: "blob",
          headers: {
            "X-Igreja-Id": idIgreja,
          },
        }
      );
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
      {/* Redireciona para a tela de cadastro/login inicialmente */}
      <Route path="/" element={<Navigate to="/cadastro-igreja" />} />

      {/* Página de cadastro e login da igreja */}
      <Route path="/cadastro-igreja" element={<CadastroIgreja />} />

      {/* Tela para confirmar o código enviado por e-mail (aparece após login/cadastro) */}
      <Route path="/confirmar-codigo" element={<ConfirmarCodigo />} />

      {/* Dashboard: protegido, acessível após login e verificação */}
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
                      setDataEdit({}); // Limpa dados para criar novo membro
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
                    .filter((user) =>
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
              />
              <SupportButton />
            </Flex>
          </Flex>
        }
      />
    </Routes>
  );
};

export default App;
