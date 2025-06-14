#include <iostream>
#include <vector>
#include <string>
#include <memory>

struct Node {
    std::string content;
    std::vector<std::shared_ptr<Node>> children;

    Node(const std::string& content) : content(content) {}
};

class Tree {
public:
    Tree() {
        root = std::make_shared<Node>("root");
    }

    // ノードを追加：親ノードと内容を指定
    std::shared_ptr<Node> addChild(std::shared_ptr<Node> parent, const std::string& content) {
        auto child = std::make_shared<Node>(content);
        parent->children.push_back(child);
        return child;
    }

    // 再帰的に木を表示
    void printTree(std::shared_ptr<Node> node, int depth = 0) {
        for (int i = 0; i < depth; ++i) std::cout << "  ";
        std::cout << "- " << node->content << std::endl;
        for (auto& child : node->children) {
            printTree(child, depth + 1);
        }
    }

    std::shared_ptr<Node> getRoot() { return root; }

private:
    std::shared_ptr<Node> root;
};

int main() {
    Tree tree;

    auto root = tree.getRoot();
    auto intro = tree.addChild(root, "Introduction");
    auto body = tree.addChild(root, "Body");
    auto conclusion = tree.addChild(root, "Conclusion");

    tree.addChild(intro, "Motivation");
    tree.addChild(intro, "Problem Statement");

    tree.addChild(body, "Method");
    tree.addChild(body, "Experiments");

    tree.addChild(conclusion, "Summary");
    tree.addChild(conclusion, "Future Work");

    tree.printTree(root);
    return 0;
}
