import { useEffect, useState } from "react";
import { 
  Flex, Box, Button, Grid, Text, Input, Heading, InputGroup, InputLeftElement, Switch
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon, AddIcon, SearchIcon } from "@chakra-ui/icons";
import { useDisclosure } from "@chakra-ui/react";
import ModalComp from "./componentes/ModalComp";
import axios from "axios";

const App = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [data, setData] = useState([]);
  const [dataEdit, setDataEdit] = useState({});
  const [search, setSearch] = useState("");
  const [statusMembros, setStatusMembros] = useState({});

  const loadUsers = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/users");
      setData(response.data);

      const statusInicial = response.data.reduce((acc, user) => {
        acc[user._id] = true; // Padrão: todos ativos
        return acc;
      }, {});
      setStatusMembros(statusInicial);

    } catch (error) {
      console.error("Erro ao carregar usuários", error);
    }
  };

  const handleGenerateLetter = async (id) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/users/${id}/carta`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Carta_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erro ao gerar carta", error);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRemove = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este usuário?")) {
      try {
        await axios.delete(`http://localhost:3000/api/users/${id}`);
        setData(data.filter(user => user._id !== id));

        setStatusMembros(prev => {
          const novoStatus = { ...prev };
          delete novoStatus[id];
          return novoStatus;
        });

      } catch (error) {
        console.error("Erro ao deletar usuário", error);
      }
    }
  };

  const toggleStatus = (id) => {
    setStatusMembros(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <Flex direction="column" align="center" bg="gray.100" minH="100vh">
      <Box bg="blue.500" w="100%" py={4} textAlign="center">
        <Heading color="white">MEMBRO CELESTIAL</Heading>
      </Box>
      <Box w="80%" my={6} p={4} bg="white" borderRadius="md" boxShadow="lg">
        <Flex justify="space-between" mb={4}>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={() => [setDataEdit({}), onOpen()]}
            _hover={{ transform: "scale(1.05)", transition: "0.2s" }}
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
            .filter(user => user.nome.toLowerCase().includes(search.toLowerCase()))
            .map(({ _id, nome }) => (
              <Box key={_id} p={4} borderWidth="1px" borderRadius="lg" boxShadow="sm">
                <Flex justify="space-between" align="center">
                  <Text fontWeight="bold" fontSize="lg">{nome}</Text>

                  {/* Toggle Switch para status */}
                  <Flex align="center">
                    <Text fontSize="sm" mr={2} fontWeight={"bold"}>
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
                    onClick={() => [setDataEdit(data.find(user => user._id === _id)), onOpen()]}
                    _hover={{ transform: "scale(1.05)", transition: "0.2s" }}
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    leftIcon={<DeleteIcon />}
                    colorScheme="red"
                    onClick={() => handleRemove(_id)}
                    _hover={{ transform: "scale(1.05)", transition: "0.2s" }}
                  >
                    Excluir
                  </Button>
                </Flex>

                {/* Botão de gerar carta */}
                <Button
                  size="sm"
                  mt={3}
                  colorScheme="blue"
                  onClick={() => handleGenerateLetter(_id)}
                  _hover={{ transform: "scale(1.05)", transition: "0.2s" }}
                  width="100%"
                >
                  Gerar Carta
                </Button>
              </Box>
            ))}
        </Grid>
      </Box>

      <ModalComp isOpen={isOpen} onClose={onClose} dataEdit={dataEdit} loadUsers={loadUsers} />
    </Flex>
  );
};

export default App;
