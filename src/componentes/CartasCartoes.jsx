import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";

import {
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";

import { SearchIcon } from "@chakra-ui/icons";

import {
  FaAddressCard,
  FaCheckCircle,
  FaFilePdf,
} from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;

const MODELOS_CARTA = [
  {
    id: "modelo1",
    nome: "Modelo 1",
    descricao:
      "Modelo branco e elegante, com cabeçalho centralizado e detalhes discretos.",
    destaque: "Clássico",
    cor: "blue",
  },
  {
    id: "modelo2",
    nome: "Modelo 2",
    descricao:
      "Modelo bege com visual moderno, formas decorativas e acabamento sofisticado.",
    destaque: "Moderno",
    cor: "orange",
  },
  {
    id: "modelo3",
    nome: "Modelo 3",
    descricao:
      "Modelo claro com moldura dourada e aparência cerimonial.",
    destaque: "Dourado",
    cor: "yellow",
  },
];

const TIPOS_CARTA = [
  {
    id: "mudanca",
    nome: "Carta de Mudança",
    descricao:
      "Usada para transferir o membro para outra igreja.",
  },
  {
    id: "recomendacao",
    nome: "Carta de Recomendação",
    descricao:
      "Usada para apresentar e recomendar o membro a outra igreja.",
  },
];

const normalizarTexto = (texto = "") => {
  return texto
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

const limparNomeArquivo = (nome = "membro") => {
  return (
    normalizarTexto(nome)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "membro"
  );
};

const obterMensagemErro = async (
  error,
  mensagemPadrao
) => {
  try {
    const dados = error.response?.data;

    if (dados instanceof Blob) {
      const texto = await dados.text();

      try {
        const json = JSON.parse(texto);

        return (
          json.message ||
          json.error ||
          mensagemPadrao
        );
      } catch {
        return texto || mensagemPadrao;
      }
    }

    return (
      dados?.message ||
      dados?.error ||
      error.message ||
      mensagemPadrao
    );
  } catch {
    return mensagemPadrao;
  }
};

const CartasCartoes = () => {
  const [membros, setMembros] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] =
    useState(true);

  const [
    gerandoDocumento,
    setGerandoDocumento,
  ] = useState("");

  const [
    membroSelecionado,
    setMembroSelecionado,
  ] = useState(null);

  const [
    modeloSelecionado,
    setModeloSelecionado,
  ] = useState("modelo1");

  const [
    tipoCarta,
    setTipoCarta,
  ] = useState("mudanca");

  const [
    igrejaDestino,
    setIgrejaDestino,
  ] = useState("");

  const [
    cidadeDestino,
    setCidadeDestino,
  ] = useState("");

  const {
    isOpen,
    onOpen,
    onClose,
  } = useDisclosure();

  const toast = useToast();

  const idIgreja =
    sessionStorage.getItem("idIgreja") || "";

  const carregarMembros = useCallback(
    async () => {
      if (!idIgreja) {
        setMembros([]);
        setCarregando(false);
        return;
      }

      try {
        setCarregando(true);

        const response = await axios.get(
          `${API_URL}/api/users`,
          {
            headers: {
              "X-Igreja-Id": idIgreja,
            },
          }
        );

        setMembros(
          Array.isArray(response.data)
            ? response.data
            : []
        );
      } catch (error) {
        console.error(
          "Erro ao carregar membros:",
          error
        );

        setMembros([]);

        toast({
          title: "Erro ao carregar membros",
          description:
            error.response?.data?.message ||
            "Não foi possível carregar os membros da igreja.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setCarregando(false);
      }
    },
    [idIgreja, toast]
  );

  useEffect(() => {
    carregarMembros();
  }, [carregarMembros]);

  const membrosFiltrados = useMemo(() => {
    const termo = normalizarTexto(busca);

    if (!termo) {
      return membros;
    }

    const termoNumerico = termo.replace(
      /\D/g,
      ""
    );

    return membros.filter((membro) => {
      const nome = normalizarTexto(
        membro.nome
      );

      const cpf = normalizarTexto(
        membro.cpf
      );

      const cpfNumerico = cpf.replace(
        /\D/g,
        ""
      );

      const numeroMembro =
        normalizarTexto(
          membro.numeroMembro ||
            membro.numero ||
            membro.matricula
        );

      return (
        nome.includes(termo) ||
        cpf.includes(termo) ||
        numeroMembro.includes(termo) ||
        Boolean(
          termoNumerico &&
            cpfNumerico.includes(
              termoNumerico
            )
        )
      );
    });
  }, [membros, busca]);

  const limparDadosModal = () => {
    setMembroSelecionado(null);
    setModeloSelecionado("modelo1");
    setTipoCarta("mudanca");
    setIgrejaDestino("");
    setCidadeDestino("");
  };

  const abrirModelosCarta = (membro) => {
    setMembroSelecionado(membro);
    setModeloSelecionado("modelo1");
    setTipoCarta("mudanca");
    setIgrejaDestino("");
    setCidadeDestino("");
    onOpen();
  };

  const fecharModal = () => {
    if (gerandoDocumento) {
      return;
    }

    limparDadosModal();
    onClose();
  };

  const gerarCarta = async () => {
    if (!membroSelecionado?._id) {
      toast({
        title: "Membro não selecionado",
        description:
          "Selecione um membro para gerar a carta.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });

      return;
    }

    if (!tipoCarta) {
      toast({
        title: "Tipo de carta não selecionado",
        description:
          "Escolha o tipo de carta.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });

      return;
    }

    if (!igrejaDestino.trim()) {
      toast({
        title:
          "Igreja de destino não informada",
        description:
          "Informe o nome da igreja que receberá o membro.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });

      return;
    }

    if (!cidadeDestino.trim()) {
      toast({
        title:
          "Cidade de destino não informada",
        description:
          "Informe a cidade e o estado da igreja de destino.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });

      return;
    }

    if (!modeloSelecionado) {
      toast({
        title: "Modelo não selecionado",
        description:
          "Escolha um modelo de carta.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });

      return;
    }

    const membroId =
      membroSelecionado._id;

    const identificador =
      `${tipoCarta}-${membroId}-${modeloSelecionado}`;

    try {
      setGerandoDocumento(identificador);

      const response = await axios.get(
        `${API_URL}/api/users/${membroId}/carta/${modeloSelecionado}`,
        {
          headers: {
            "X-Igreja-Id": idIgreja,
          },

          params: {
            tipoCarta,
            igrejaDestino:
              igrejaDestino.trim(),
            cidadeDestino:
              cidadeDestino.trim(),
          },

          responseType: "blob",
        }
      );

      const contentType =
        response.headers["content-type"] ||
        "";

      if (
        !contentType.includes(
          "application/pdf"
        )
      ) {
        const erro = new Error(
          "O backend não retornou um arquivo PDF."
        );

        erro.response = response;

        throw erro;
      }

      const arquivo = new Blob(
        [response.data],
        {
          type: "application/pdf",
        }
      );

      const url =
        window.URL.createObjectURL(arquivo);

      const link =
        document.createElement("a");

      const nomeMembro = limparNomeArquivo(
        membroSelecionado.nome
      );

      link.href = url;
      link.download =
        `${tipoCarta}-${nomeMembro}-${modeloSelecionado}.pdf`;

      document.body.appendChild(link);

      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      toast({
        title: "Carta gerada",
        description:
          "O download da carta foi iniciado.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onClose();
      limparDadosModal();
    } catch (error) {
      console.error(
        "Erro ao gerar carta:",
        error
      );

      const mensagem =
        await obterMensagemErro(
          error,
          "Não foi possível gerar a carta."
        );

      toast({
        title: "Erro ao gerar carta",
        description: mensagem,
        status: "error",
        duration: 6000,
        isClosable: true,
      });
    } finally {
      setGerandoDocumento("");
    }
  };

  const cartaSendoGerada =
    Boolean(gerandoDocumento);

  const tipoAtual =
    TIPOS_CARTA.find(
      (tipo) => tipo.id === tipoCarta
    ) || TIPOS_CARTA[0];

  return (
    <>
      <Box
        w="100%"
        maxW="1200px"
        mx="auto"
        p={{
          base: 4,
          md: 8,
        }}
      >
        <Flex
          justify="space-between"
          align={{
            base: "flex-start",
            md: "center",
          }}
          direction={{
            base: "column",
            md: "row",
          }}
          gap={4}
          mb={6}
        >
          <Box>
            <Heading
              mb={2}
              color="blue.600"
            >
              Cartas e cartões
            </Heading>

            <Text color="gray.600">
              Pesquise um membro e escolha
              o documento que deseja gerar.
            </Text>
          </Box>

          <Badge
            colorScheme="blue"
            fontSize="sm"
            px={3}
            py={1}
            borderRadius="full"
          >
            {membros.length}{" "}
            {membros.length === 1
              ? "membro"
              : "membros"}
          </Badge>
        </Flex>

        <InputGroup
          maxW="600px"
          mb={6}
        >
          <InputLeftElement
            pointerEvents="none"
          >
            <SearchIcon color="gray.500" />
          </InputLeftElement>

          <Input
            bg="white"
            placeholder="Buscar por nome, CPF ou número de membro"
            value={busca}
            onChange={(event) =>
              setBusca(event.target.value)
            }
          />
        </InputGroup>

        {carregando ? (
          <Flex
            justify="center"
            align="center"
            minH="200px"
          >
            <Spinner
              size="xl"
              color="blue.500"
            />
          </Flex>
        ) : membrosFiltrados.length ===
          0 ? (
          <Box
            bg="white"
            borderWidth="1px"
            borderRadius="lg"
            p={8}
            textAlign="center"
          >
            <Text fontWeight="bold">
              Nenhum membro encontrado.
            </Text>
          </Box>
        ) : (
          <Grid
            templateColumns={{
              base: "1fr",
              lg: "repeat(2, 1fr)",
            }}
            gap={4}
          >
            {membrosFiltrados.map(
              (membro) => (
                <Box
                  key={membro._id}
                  bg="white"
                  borderWidth="1px"
                  borderRadius="lg"
                  boxShadow="sm"
                  p={5}
                >
                  <Flex
                    justify="space-between"
                    align={{
                      base: "flex-start",
                      sm: "center",
                    }}
                    direction={{
                      base: "column",
                      sm: "row",
                    }}
                    gap={4}
                  >
                    <Box>
                      <Text
                        fontSize="lg"
                        fontWeight="bold"
                      >
                        {membro.nome}
                      </Text>

                      <Text
                        fontSize="sm"
                        color={
                          membro.ativo === false
                            ? "red.600"
                            : "green.600"
                        }
                        fontWeight="bold"
                      >
                        {membro.ativo === false
                          ? "Inativo"
                          : "Ativo"}
                      </Text>

                      {membro.cpf && (
                        <Text
                          fontSize="sm"
                          color="gray.600"
                          mt={1}
                        >
                          CPF: {membro.cpf}
                        </Text>
                      )}
                    </Box>

                    <Flex gap={2}>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        leftIcon={
                          <FaFilePdf />
                        }
                        onClick={() =>
                          abrirModelosCarta(
                            membro
                          )
                        }
                      >
                        Gerar carta
                      </Button>

                      <Button
                        size="sm"
                        colorScheme="yellow"
                        leftIcon={
                          <FaAddressCard />
                        }
                        isDisabled
                      >
                        Gerar cartão
                      </Button>
                    </Flex>
                  </Flex>
                </Box>
              )
            )}
          </Grid>
        )}
      </Box>

      <Modal
        isOpen={isOpen}
        onClose={fecharModal}
        size="4xl"
        isCentered
        scrollBehavior="inside"
        closeOnOverlayClick={
          !cartaSendoGerada
        }
        closeOnEsc={!cartaSendoGerada}
      >
        <ModalOverlay />

        <ModalContent>
          <ModalHeader>
            Gerar documento
          </ModalHeader>

          {!cartaSendoGerada && (
            <ModalCloseButton />
          )}

          <ModalBody>
            {membroSelecionado && (
              <Box
                bg="blue.50"
                borderRadius="md"
                p={4}
                mb={5}
              >
                <Text
                  fontSize="sm"
                  color="gray.600"
                >
                  Documento para:
                </Text>

                <Text
                  fontSize="lg"
                  fontWeight="bold"
                  color="blue.700"
                >
                  {membroSelecionado.nome}
                </Text>
              </Box>
            )}

            <FormControl mb={6}>
              <FormLabel>
                Tipo de carta
              </FormLabel>

              <Grid
                templateColumns={{
                  base: "1fr",
                  md: "repeat(2, 1fr)",
                }}
                gap={4}
              >
                {TIPOS_CARTA.map((tipo) => {
                  const selecionado =
                    tipoCarta === tipo.id;

                  return (
                    <Box
                      key={tipo.id}
                      borderWidth="2px"
                      borderColor={
                        selecionado
                          ? "blue.500"
                          : "gray.200"
                      }
                      bg={
                        selecionado
                          ? "blue.50"
                          : "white"
                      }
                      borderRadius="lg"
                      p={4}
                      cursor={
                        cartaSendoGerada
                          ? "not-allowed"
                          : "pointer"
                      }
                      position="relative"
                      onClick={() => {
                        if (
                          !cartaSendoGerada
                        ) {
                          setTipoCarta(
                            tipo.id
                          );
                        }
                      }}
                    >
                      {selecionado && (
                        <Box
                          position="absolute"
                          top={3}
                          right={3}
                          color="blue.500"
                        >
                          <FaCheckCircle
                            size={20}
                          />
                        </Box>
                      )}

                      <Text
                        fontWeight="bold"
                        mb={2}
                      >
                        {tipo.nome}
                      </Text>

                      <Text
                        fontSize="sm"
                        color="gray.600"
                        pr={5}
                      >
                        {tipo.descricao}
                      </Text>
                    </Box>
                  );
                })}
              </Grid>
            </FormControl>

            <Grid
              templateColumns={{
                base: "1fr",
                md: "repeat(2, 1fr)",
              }}
              gap={4}
              mb={6}
            >
              <FormControl isRequired>
                <FormLabel>
                  Igreja de destino
                </FormLabel>

                <Input
                  placeholder="Ex.: Assembleia de Deus Ministério Moriáh"
                  value={igrejaDestino}
                  onChange={(event) =>
                    setIgrejaDestino(
                      event.target.value
                    )
                  }
                  isDisabled={
                    cartaSendoGerada
                  }
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>
                  Cidade e estado
                </FormLabel>

                <Input
                  placeholder="Ex.: Peruíbe/SP"
                  value={cidadeDestino}
                  onChange={(event) =>
                    setCidadeDestino(
                      event.target.value
                    )
                  }
                  isDisabled={
                    cartaSendoGerada
                  }
                />
              </FormControl>
            </Grid>

            <Text
              fontWeight="bold"
              fontSize="lg"
              mb={3}
            >
              Escolha o modelo visual
            </Text>

            <Grid
              templateColumns={{
                base: "1fr",
                md: "repeat(3, 1fr)",
              }}
              gap={4}
            >
              {MODELOS_CARTA.map(
                (modelo) => {
                  const selecionado =
                    modeloSelecionado ===
                    modelo.id;

                  return (
                    <Box
                      key={modelo.id}
                      position="relative"
                      borderWidth="2px"
                      borderColor={
                        selecionado
                          ? "blue.500"
                          : "gray.200"
                      }
                      bg={
                        selecionado
                          ? "blue.50"
                          : "white"
                      }
                      borderRadius="lg"
                      p={4}
                      cursor={
                        cartaSendoGerada
                          ? "not-allowed"
                          : "pointer"
                      }
                      minH="190px"
                      onClick={() => {
                        if (
                          !cartaSendoGerada
                        ) {
                          setModeloSelecionado(
                            modelo.id
                          );
                        }
                      }}
                    >
                      {selecionado && (
                        <Box
                          position="absolute"
                          top={3}
                          right={3}
                          color="blue.500"
                        >
                          <FaCheckCircle
                            size={20}
                          />
                        </Box>
                      )}

                      <Flex
                        align="center"
                        justify="center"
                        h="70px"
                        mb={3}
                        borderRadius="md"
                        bg={
                          modelo.id ===
                          "modelo1"
                            ? "gray.50"
                            : modelo.id ===
                              "modelo2"
                            ? "orange.50"
                            : "yellow.50"
                        }
                        borderWidth="1px"
                      >
                        <FaFilePdf size={32} />
                      </Flex>

                      <Badge
                        colorScheme={
                          modelo.cor
                        }
                        mb={2}
                      >
                        {modelo.destaque}
                      </Badge>

                      <Text
                        fontWeight="bold"
                        mb={2}
                      >
                        {modelo.nome}
                      </Text>

                      <Text
                        fontSize="sm"
                        color="gray.600"
                      >
                        {modelo.descricao}
                      </Text>
                    </Box>
                  );
                }
              )}
            </Grid>
          </ModalBody>

          <ModalFooter gap={3}>
            <Button
              variant="ghost"
              onClick={fecharModal}
              isDisabled={
                cartaSendoGerada
              }
            >
              Cancelar
            </Button>

            <Button
              colorScheme="blue"
              leftIcon={<FaFilePdf />}
              onClick={gerarCarta}
              isLoading={
                cartaSendoGerada
              }
              loadingText="Gerando carta"
            >
              Gerar {tipoAtual.nome}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CartasCartoes;